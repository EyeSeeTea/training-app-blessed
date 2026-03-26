import { Codec, GetSchemaType, Schema } from "../../utils/codec";
import { TranslatableText, TranslatableTextModel } from "./TranslatableText";
import { SharedProperties, SharedPropertiesModel } from "./Ref";
import { User, validateUserPermission } from "../../data/entities/User";
import { generateUid } from "../../data/utils/uid";
import _ from "lodash";

export const LandingPageNodeTypeModel = Schema.oneOf([
    Schema.exact("root"),
    Schema.exact("section"),
    Schema.exact("sub-section"),
    Schema.exact("category"),
]);

export type LandingNodeType = GetSchemaType<typeof LandingPageNodeTypeModel>;

export interface LandingNode {
    id: string;
    parent: string;
    type: LandingNodeType;
    icon: string;
    order: number | undefined;
    name: TranslatableText;
    title: TranslatableText | undefined;
    content: TranslatableText | undefined;
    modules: string[];
    children: LandingNode[];
    permissions: SharedProperties;
}

export const LandingNodeModel: Codec<LandingNode> = Schema.object({
    id: Schema.string,
    parent: Schema.string,
    type: LandingPageNodeTypeModel,
    icon: Schema.optionalSafe(Schema.string, ""),
    order: Schema.optional(Schema.integer),
    name: TranslatableTextModel,
    title: Schema.optional(TranslatableTextModel),
    content: Schema.optional(TranslatableTextModel),
    modules: Schema.optionalSafe(Schema.array(Schema.string), []),
    children: Schema.lazy(() => Schema.array(LandingNodeModel)),
    permissions: SharedPropertiesModel,
});

export interface OrderedLandingNode extends LandingNode {
    lastOrder: number;
}

export const buildOrderedLandingNodes = (nodes: LandingNode[]): OrderedLandingNode[] => {
    return nodes.map(node => ({
        ...node,
        lastOrder: nodes.length - 1,
        children: buildOrderedLandingNodes(node.children),
    }));
};

export function getUserRootLandings(nodes: LandingNode[], user: User) {
    return nodes.filter(node => {
        return node.type === "root" && validateUserPermission(node.permissions, "read", user);
    });
}

export function getDefaultLandingNode(props: { type: LandingNodeType; parent: string; order: number }): LandingNode {
    const { type, parent, order } = props;
    return {
        id: generateUid(),
        type,
        parent,
        icon: "",
        order,
        name: { key: "", referenceValue: "", translations: {} },
        title: undefined,
        content: undefined,
        children: [],
        modules: [],
        permissions: {
            publicAccess: "r-------",
            userAccesses: [],
            userGroupAccesses: [],
        },
    };
}

export function flattenNodes(nodes: LandingNode[]): LandingNode[] {
    return _.flatMap(nodes, row => [row, ...flattenNodes(row.children)]);
}
