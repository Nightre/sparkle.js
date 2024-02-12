import { IResources, ResourcesType } from "../interface";

class Resources implements IResources {
    /**
     * @ignore
     */
    resourcesId?: string;
    /**
     * @ignore
     */
    resourcesType = ResourcesType.ANIMATION
}

export default Resources