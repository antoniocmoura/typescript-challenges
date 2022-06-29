export interface IRequestParams {
    url: string,
    method: string,
    body?: object | null | string
}

export interface IUserCredentials {
    username: string,
    password: string,
    api_key: string,
    request_token?: string,
    session_id?: string,
    account_id?: string
}

export interface IMovie {
    id: number,
    original_title: string;
    poster_path: string;
}

export interface IMovieList {
    id: number
    name: string,
    description: string,
    items: Array<IMovie>
}

export interface IListItems {
    items: Array<IMovieList>
}

export interface IResponse {
    id?: number,
    request_token?: string,
    session_id?: string,
    page?: string,
    results?: Array<IMovie> | Array<IMovieList>,
    items?: Array<IMovie>, 
    list_id?: number
}

export interface IResponseError {
    status: number,
    statusText: string
}

export interface IAlert {
    type: string,
    title: string,
    message: string;
    button_text: string;
    img?: string;
    close_style?: string;
    confirm_text?:string;
    cancel_text?:string;
}

export enum MENU_STATE {
    Visible,
    Invisible
}