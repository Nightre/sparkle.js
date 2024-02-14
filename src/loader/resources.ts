import { IResources, ResourcesType } from "../interface";

class Resources implements IResources {
    /**
     * @ignore
     */
    resourcesId?: string;
    /**
     * @ignore
     */
    resourcesType?:ResourcesType;
}

export default Resources