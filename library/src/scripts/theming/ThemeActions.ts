/**
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import ReduxActions, { bindThunkAction, useReduxActions } from "@library/redux/ReduxActions";
import { actionCreatorFactory } from "typescript-fsa";
import { IApiError } from "@library/@types/api/core";
import { ITheme, IThemeAssets, IThemeRevision } from "@library/theming/themeReducer";
import { IThemeInfo } from "@library/theming/CurrentThemeInfo";
import { resetThemeCache } from "@library/styles/styleUtils";
import { reinit, forceRenderStyles } from "typestyle";
import { setMeta } from "@library/utility/appUtils";

const createAction = actionCreatorFactory("@@themes");

type IGetThemeResponse = ITheme;
export interface IPatchThemeRequest {
    themeID: string | number;
    name?: string;
    parentTheme?: string;
    parentVersion?: string;
    revisionID?: number;
    assets?: Partial<IPostPatchThemeAssets>;
}
export type IPostPatchThemeAssets = Partial<IThemeAssets>;

export enum PreviewStatusType {
    PREVIEW = "preview",
    APPLY = "apply",
    CANCEL = "cancel",
}
export interface IManageTheme extends ITheme {
    preview: {
        info: IThemeInfo;
        [key: string]: any;
    };
}

type IGetAllThemeResponse = IManageTheme[];
type IPatchThemeResponse = ITheme;

interface IPutCurrentThemeRequest {
    themeID: number | string;
    revisionID?: number;
    type: PreviewStatusType;
}
/**
 * Actions for working with resources from the /api/v2/knowledge-bases endpoint.
 */

export default class ThemeActions extends ReduxActions {
    public static getAssets = createAction.async<{ themeKey: string; revisionID: number | null }, ITheme, IApiError>(
        "GET",
    );

    public getAssets = (themeKey: string, revisionID: number | null = null) => {
        const { theme } = this.getState();
        if (theme.assets.data) {
            return theme.assets.data;
        }

        const apiThunk = bindThunkAction(ThemeActions.getAssets, async () => {
            const response = await this.api.get(`/themes/${themeKey}`, {
                params: { revisionID: revisionID },
            });

            return response.data;
        })({ themeKey, revisionID });
        return this.dispatch(apiThunk);
    };

    public static forceVariablesAC = createAction<Record<string, any>>("FORCE_VARIABLES");

    public forceVariables = (variables: Record<string, any>) => {
        this.dispatch(ThemeActions.forceVariablesAC(variables));

        // Clear the cache of variables.
        resetThemeCache();
        forceRenderStyles();
    };

    public static readonly getAllThemes_ACS = createAction.async<{}, IGetAllThemeResponse, IApiError>("GET_ALL_THEMES");

    public static readonly putCurrentThemeACs = createAction.async<
        { themeID: number | string },
        IManageTheme,
        IApiError
    >("PUT_CURRENT");

    public static readonly putPreviewThemeACs = createAction.async<IPutCurrentThemeRequest, IManageTheme, IApiError>(
        "PUT_PREVIEW",
    );

    public static readonly deleteThemeACs = createAction.async<{ themeID: number | string }, undefined, IApiError>(
        "DELETE",
    );

    public static getThemeRevisions_ACs = createAction.async<{ themeID: number | string }, IThemeRevision[], IApiError>(
        "GET_THEME",
    );

    public static patchTheme_ACs = createAction.async<IPatchThemeRequest, IPatchThemeResponse, IApiError>(
        "PATCH_THEME",
    );

    public getAllThemes = () => {
        const thunk = bindThunkAction(ThemeActions.getAllThemes_ACS, async () => {
            const params = { expand: "all" };
            const response = await this.api.get(`/themes/`, { params });

            return response.data;
        })();
        return this.dispatch(thunk);
    };

    public putCurrentTheme = (themeID: number | string) => {
        const body = { themeID };
        const thunk = bindThunkAction(ThemeActions.putCurrentThemeACs, async () => {
            const response = await this.api.put(`/themes/current`, body);
            setMeta("ui.themeKey", themeID);
            setMeta("ui.mobileThemeKey", themeID);
            return response.data;
        })(body);
        return this.dispatch(thunk);
    };

    public putPreviewTheme = (options: IPutCurrentThemeRequest) => {
        const { themeID, revisionID, type } = options;
        const thunk = bindThunkAction(ThemeActions.putPreviewThemeACs, async () => {
            const response = await this.api.put(`/themes/preview`, { themeID: themeID, revisionID: revisionID });

            return response.data;
        })(options);
        return this.dispatch(thunk);
    };

    public deleteTheme = (themeID: number | string) => {
        const apiThunk = bindThunkAction(ThemeActions.deleteThemeACs, async () => {
            const response = await this.api.delete(`/themes/${themeID}`);
            return response.data;
        })({ themeID });
        return this.dispatch(apiThunk);
    };

    public getThemeRevisions(themeID: number | string) {
        const thunk = bindThunkAction(ThemeActions.getThemeRevisions_ACs, async () => {
            const response = await this.api.get(`/themes/${themeID}/revisions`);
            return response.data;
        })({ themeID });

        return this.dispatch(thunk);
    }

    public patchThemeWithRevisionID = async (body: IPatchThemeRequest) => {
        let result = await this.patchTheme({ themeID: body.themeID, revisionID: body.revisionID });
        return result;
    };

    public patchTheme(options: IPatchThemeRequest) {
        const { themeID, ...body } = options;

        const thunk = bindThunkAction(ThemeActions.patchTheme_ACs, async () => {
            const response = await this.api.patch(`/themes/${options.themeID}`, body);
            return response.data;
        })(options);

        return this.dispatch(thunk);
    }
}

export function useThemeActions() {
    return useReduxActions(ThemeActions);
}
