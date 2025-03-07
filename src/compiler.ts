// @ts-check
import childProcess from "node:child_process";
import fs from "node:fs";
import * as jsonSchemaToTypescript from "json-schema-to-typescript";
import path from "node:path";

const __dirname = new URL(".", import.meta.url).pathname;
const jarFolder = `../libs`;

export async function compile(
    inputXSDContent: string,
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
    }
): Promise<string> {
    let { name, removeIndexSignatures, convertUnknownsToString, convertTuplesToArray } = options;

    removeIndexSignatures ??= true;
    convertUnknownsToString ??= true;
    convertTuplesToArray ??= true;

    const tempFolder = path.resolve(`temp`);
    const tempFileName = `${name}.xsd`;
    const tempFilePath = `${tempFolder}/${tempFileName}`;
    fs.mkdirSync(tempFolder, { recursive: true });
    fs.writeFileSync(tempFilePath, inputXSDContent);

    childProcess.execSync(`java --add-opens=java.base/java.lang=ALL-UNNAMED -cp "${jarFolder}/jsonix-schema-compiler-full-2.3.9.jar:${jarFolder}/javax.activation-1.2.0.jar" org.hisrc.jsonix.JsonixMain -d ${tempFolder} -p ${name} ${tempFilePath}`, { shell: true as any, cwd: __dirname });
    childProcess.execSync(`java --add-opens=java.base/java.lang=ALL-UNNAMED -cp "${jarFolder}/jsonix-schema-compiler-full-2.3.9.jar:${jarFolder}/javax.activation-1.2.0.jar" org.hisrc.jsonix.JsonixMain -d ${tempFolder} -generateJsonSchema -p ${name} ${tempFilePath}`, { shell: true as any, cwd: __dirname });

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

    const poName = `${name}PO`;
    let poFile = fs
        .readFileSync(`${tempFolder}/${name}.js`, "utf-8")
        // everything in the first line
        .replace(/^.*\n  var .* = {\n/, `const ${poName} = {\n`);
    // remove all lines after including return {
    poFile = poFile.slice(0, poFile.indexOf("return {"));

    let combined = `${types}\n${poFile}\nconst context = new Jsonix.Context([${poName}]);
const unmarshaller = context.createUnmarshaller();
const marshaller = context.createMarshaller();
export function xmlTo${name}Response(xml: string): ${name} {
    return unmarshaller.unmarshalString(xml).value as ${name};
}
export function ${name[0].toLowerCase()}${name.slice(1)}ToXml(obj: ${name}): string {
    return marshaller.marshalString(obj as any);
}`;

    const lines = combined.split("\n");
    lines.splice(6, 0, 'import { Jsonix } from "@dein-ticket-shop/jsonix";');
    combined = lines.join("\n");

    return combined;
}
