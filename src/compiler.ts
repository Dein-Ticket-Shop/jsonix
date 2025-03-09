// @ts-check
import childProcess from "node:child_process";
import fs from "node:fs";
import * as jsonSchemaToTypescript from "json-schema-to-typescript";
import path from "node:path";

const __dirname = new URL(".", import.meta.url).pathname;
const jarFolder = `../libs`;

export async function compile(
    inputPath: string,
    options: {
        name: string;
        /**
         * @default true
         */
        removeIndexSignatures?: boolean;
        /**
         * @default true
         */
        convertUnknownsToString?: boolean;
        /**
         * @default true
         */
        convertTuplesToArray?: boolean;
        /**
         * @default true
         */
        cleanStringOrNullUnions?: boolean;
    }
): Promise<string> {
    let { name, removeIndexSignatures, convertUnknownsToString, convertTuplesToArray, cleanStringOrNullUnions } = options;
    inputPath = path.resolve(inputPath);
    removeIndexSignatures ??= true;
    convertUnknownsToString ??= true;
    convertTuplesToArray ??= true;
    cleanStringOrNullUnions ??= true;

    const tempFolder = path.resolve(`temp`);
    fs.mkdirSync(tempFolder, { recursive: true });

    await exec(`java --add-opens=java.base/java.lang=ALL-UNNAMED -cp "${jarFolder}/jsonix-schema-compiler-full-2.3.9.jar:${jarFolder}/javax.activation-1.2.0.jar" org.hisrc.jsonix.JsonixMain -d ${tempFolder} -p ${name} ${inputPath}`, { shell: true as any, cwd: __dirname, stdio: "inherit" });
    await exec(`java --add-opens=java.base/java.lang=ALL-UNNAMED -cp "${jarFolder}/jsonix-schema-compiler-full-2.3.9.jar:${jarFolder}/javax.activation-1.2.0.jar" org.hisrc.jsonix.JsonixMain -d ${tempFolder} -generateJsonSchema -p ${name} ${inputPath}`, { shell: true as any, cwd: __dirname, stdio: "inherit" });

    const schemaContents = fs.readFileSync(`${tempFolder}/${name}.jsonschema`, "utf-8").replace(/http:\/\/www.jsonix.org\/jsonschemas\//g, "node_modules/jsonix/jsonschemas/");
    let types = await jsonSchemaToTypescript.compile(JSON.parse(schemaContents), name, {});

    if (removeIndexSignatures) {
        // remove all lines which are [k: string]: unknown; and whitespaces
        types = types.replace(/\s*\[k: string\]: unknown;\s\n*/g, "\n");
    }

    if (convertUnknownsToString) {
        // now make empty types strings
        types = types.replace(/export type (.*) = {\n};/g, "export type $1 = string;");
    }

    if (convertTuplesToArray) {
        // replace tuples with arrays
        types = types.replace(/\[.*, \.\.\.(.*)\]/g, "$1");
    }

    if (cleanStringOrNullUnions) {
        // (string | null) &
        types = types.replace(/\(string \| null\) &/g, "");
    }

    const poName = `${name}PO`;
    let poFile = fs
        .readFileSync(`${tempFolder}/${name}.js`, "utf-8")
        // everything in the first line
        .replace(/^.*\n  var .* = {\n/, `const ${poName} = {\n`);
    // remove all lines after including return {
    poFile = poFile.slice(0, poFile.indexOf("return {"));

    const baseTypeName = types.match(/export type (.*) =/)?.[1];
    if (!baseTypeName) {
        console.log(types);
        throw new Error("Could not find base type name there");
    }

    let combined = `${types}\n${poFile}\nconst context = new Jsonix.Context<${baseTypeName}>([${poName}]);
const unmarshaller = context.createUnmarshaller();
const marshaller = context.createMarshaller();
export function xmlTo${name}Response(xml: string) {
    return unmarshaller.unmarshalString(xml).value!;
}
export function ${name[0].toLowerCase()}${name.slice(1)}ToXml(obj: Required<${baseTypeName}["value"]>): string {
    return marshaller.marshalString(obj);
}`;

    const lines = combined.split("\n");
    lines.splice(6, 0, 'import { Jsonix } from "@dein-ticket-shop/jsonix";');
    combined = lines.join("\n");

    fs.rmSync(`${tempFolder}/${name}.jsonschema`);
    fs.rmSync(`${tempFolder}/${name}.js`);

    return combined;
}

async function exec(command, options) {
    return new Promise((resolve, reject) => {
        childProcess.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}
