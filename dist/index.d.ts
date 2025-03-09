type TBase = {
    value?: any;
};

/**
 * (description)
 *
 * @interface Unmarshaller
 */
interface Unmarshaller<T extends TBase> {
    /**
     * (description)
     *
     * @param {string} arg (description)
     * @returns {T} (description)
     */
    unmarshalString(arg: string): T;

    /**
     * (description)
     *
     * @param {string} fileName (description)
     * @param {(unmarshalled:T)=> void} callback (description)
     * @param {Object} options (description)
     */
    unmarshalFile(fileName: string, callback: (unmarshalled: T) => void, options: Object): void;

    /**
     * (description)
     *
     * @param {string} url (description)
     * @param {(unmarshalled:T)=> void} callback (description)
     * @param {Object} options (description)
     */
    unmarshalURL(url: string, callback: (unmarshalled: T) => void, options: Object): void;

    /**
     * (description)
     *
     * @param {Element} doc (description)
     * @param {string} scope (description)
     * @returns {T} (description)
     */
    unmarshalDocument(doc: Element, scope: string): T;
}
/**
 * (description)
 *
 * @interface Marshaller
 */
interface Marshaller<T extends TBase> {
    // TODO: generics like marshalString(object:T):string;
    /**
     * (description)
     *
     * @param {T} object (description)
     * @returns {string} (description)
     */
    marshalString(object: T["value"]): string;

    /**
     * (description)
     *
     * @param {T} object (description)
     * @returns {Element} (description)
     */
    marshalDocument(object: T["value"]): Element;
}

export namespace Jsonix {
    export class Context<T extends TBase> {
        /**
         * Creates an instance of Context.
         *
         * @param {any[]} s (description)
         */
        constructor(s: any[]);

        /**
         * (description)
         *
         * @param {string} name (description)
         * @returns {TypeInfo} (description)
         */
        getTypeInfoByName(name: string): TypeInfo;

        /**
         * (description)
         *
         * @param {string} typeName (description)
         * @returns {TypeInfo} (description)
         */
        getTypeInfoByTypeName(typeName: string): TypeInfo;

        /**
         * (description)
         *
         * @param {string} typeNameKey (description)
         * @returns {TypeInfo} (description)
         */
        getTypeInfoByTypeNameKey(typeNameKey: string): TypeInfo;

        getElementInfo(name: string, scope: string): any;

        getSubstitutionMembers(name: string): any;

        createMarshaller(): Marshaller<T>;

        createUnmarshaller(): Unmarshaller<T>;

        getNamespaceURI(prefix: string): any;

        getPrefix(namespaceURI: string, defaultPrefix: string): any;

        builtinTypeInfos: {
            Jsonix: {
                Schema: {
                    XSD: {
                        AnyType: { INSTANCE: {} };
                        AnySimpleType: { INSTANCE: {} };
                        AnyURI: { INSTANCE: {} };
                        Base64Binary: { INSTANCE: {} };
                        Boolean: { INSTANCE: {} };
                        Byte: { INSTANCE: {} };
                        Calendar: { INSTANCE: {} };
                        DateAsDate: { INSTANCE: {} };
                        Date: { INSTANCE: {} };
                        DateTimeAsDate: { INSTANCE: {} };
                        DateTime: { INSTANCE: {} };
                        Decimal: { INSTANCE: {} };
                        Double: { INSTANCE: {} };
                        Duration: { INSTANCE: {} };
                        Float: { INSTANCE: {} };
                        GDay: { INSTANCE: {} };
                        GMonth: { INSTANCE: {} };
                        GMonthDay: { INSTANCE: {} };
                        GYear: { INSTANCE: {} };
                        GYearMonth: { INSTANCE: {} };
                        HexBinary: { INSTANCE: {} };
                        ID: { INSTANCE: {} };
                        IDREF: { INSTANCE: {} };
                        IDREFS: { INSTANCE: {} };
                        Int: { INSTANCE: {} };
                        Integer: { INSTANCE: {} };
                        Language: { INSTANCE: {} };
                        Long: { INSTANCE: {} };
                        Name: { INSTANCE: {} };
                        NCName: { INSTANCE: {} };
                        NegativeInteger: { INSTANCE: {} };
                        NMToken: { INSTANCE: {} };
                        NMTokens: { INSTANCE: {} };
                        NonNegativeInteger: { INSTANCE: {} };
                        NonPositiveInteger: { INSTANCE: {} };
                        NormalizedString: { INSTANCE: {} };
                        Number: { INSTANCE: {} };
                        PositiveInteger: { INSTANCE: {} };
                        QName: { INSTANCE: {} };
                        Short: { INSTANCE: {} };
                        String: { INSTANCE: {} };
                        Strings: { INSTANCE: {} };
                        TimeAsDate: { INSTANCE: {} };
                        Time: { INSTANCE: {} };
                        Token: { INSTANCE: {} };
                        UnsignedByte: { INSTANCE: {} };
                        UnsignedInt: { INSTANCE: {} };
                        UnsignedLong: { INSTANCE: {} };
                        UnsignedShort: { INSTANCE: {} };
                    };
                };
            };
        }[];

        // private
        elementInfos: ClassInfo[];
    }
}

/**
 * (description)
 *
 * @interface Styled
 */
interface Styled {
    CLASS_NAME: string;
    mappingStyle: Object;
}

//TODO: package Schema.XSD
/**
 * (description)
 *
 * @interface QName
 */
interface QName {
    CLASS_NAME: string;
    key: string;
    namespaceURI: string;
    localPart: string;
    prefix: string;
    string: string;
}

//TODO: package mapping
/**
 * (description)
 *
 * @interface TypeInfo
 */
interface TypeInfo {
    name: string;
    baseTypeInfo: TypeInfo;
}

/**
 * (description)
 *
 * @interface EnumLeafInfo
 * @extends {TypeInfo}
 */
interface EnumLeafInfo extends TypeInfo {
    name: string;
    baseTypeInfo: TypeInfo;
    entries: { [name: string]: string };
    keys: { [index: number]: string };
    values: { [index: number]: string };
    built: boolean;
}

/**
 * (description)
 *
 * @interface PropertyInfo
 */
interface PropertyInfo {
    CLASS_NAME: string;
    name: string;
    collection: boolean;
    targetNamespace: string;
    defaultElementNamespaceURI: string;
    defaultAttributeNamespaceURI: string;
    built: boolean;
}

/**
 * (description)
 *
 * @interface AbstractElementPropertyInfo
 * @extends {PropertyInfo}
 */
interface AbstractElementPropertyInfo extends PropertyInfo {
    wrapperElement: QName;
    allowDom: boolean;
    allowTypedObject;
    boolean;
    mixed: boolean;
}

/**
 * (description)
 *
 * @interface ElementPropertyInfo
 * @extends {AbstractElementPropertyInfo}
 */
interface ElementPropertyInfo extends AbstractElementPropertyInfo {
    typeInfo: TypeInfo | string;
    elementName: QName;
}

/**
 * (description)
 *
 * @interface ClassInfo
 * @extends {TypeInfo}
 * @extends {Styled}
 */
interface ClassInfo extends TypeInfo, Styled {
    CLASS_NAME: string;
    localName: string;
    typeName: QName;
    instanceFactory: {};
    properties: { [index: number]: PropertyInfo };
    propertiesMap: { [name: string]: PropertyInfo };
    //is inner class
    structure: {
        elements: { [fqn: string]: PropertyInfo };
        attributes: {};
        anyAttribute: {};
        value: {};
        any: {};
    };
    targetNamespace: string;
    defaultElementNamespaceURI: string;
    defaultAttributeNamespaceURI: string;
    built: boolean;
    //TODO: confirm this syntax
    propertyInfoCreators: {
        aa: { aa };
        anyAttribute: { aa };
        ae: { ae };
        anyElement: { ae };
        a: { a };
        attribute: { a };
        em: { em };
        elementMap: { em };
        e: { e };
        element: { e };
        es: { es };
        elements: { es };
        er: { er };
        elementRef: { er };
        ers: { ers };
        elementRefs: { ers };
        v: { v };
        value: { v };
    };
}
