import { IRequestParams, IResponse, IResponseError, IUserCredentials, IMovieList, IMovie } from './interfaces';

class HttpClient {
    static async get(requestParams: IRequestParams): Promise<IResponse> {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open(requestParams.method, requestParams.url, true);
            request.onload = () => {
                if (request.status >= 200 && request.status < 300) {
                    resolve(JSON.parse(request.responseText));
                } else {
                    console.log(request)
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    })
                }
            }
            request.onerror = () => {
                console.log(request)
                reject({
                    status: request.status,
                    statusText: request.statusText
                })
            }
            if (requestParams.body) {
                request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                requestParams.body = JSON.stringify(requestParams.body);
            }
            request.send(requestParams.body);
        })
    }
}

export default class TheMovieDB {

    BASE_URL: string;
    userCredentials: IUserCredentials;
    onError: Function;

    constructor(BASE_URL: string, userCredentials: IUserCredentials, onError: Function) {
        this.BASE_URL = BASE_URL;
        this.userCredentials = userCredentials;
        this.onError = onError;
    }

    async login(): Promise<boolean> {
        let loginSuccess = (await this.createRequestToken()) && (await this.authenticateUser()) && (await this.createSession()) && (await this.getAccountID())
        return loginSuccess;
    }

    async createRequestToken(): Promise<boolean> {
        let result: boolean = false;
        await HttpClient.get({
            url: `${this.BASE_URL}authentication/token/new?api_key=${this.userCredentials.api_key}`,
            method: "GET"
        }).then((response: IResponse) => {
            this.userCredentials.request_token = response.request_token;
            result = true;
        }, (response: IResponseError) => {
            if (this.onError) {
                this.onError(response, 'Erro ao obter o token, verifique se sua API KEY está correta');
            }
        })
        return result;
    }

    async authenticateUser(): Promise<boolean> {
        let result: boolean = false;
        await HttpClient.get({
            url: `${this.BASE_URL}authentication/token/validate_with_login?api_key=${this.userCredentials.api_key}`,
            method: "POST",
            body: {
                username: `${this.userCredentials.username}`,
                password: `${this.userCredentials.password}`,
                request_token: `${this.userCredentials.request_token}`
            }
        }).then(() => {
            result = true;
        }, (response: IResponseError) => {
            if (this.onError) {
                this.onError(response, 'Erro ao autenticar o usuário, verifique seu usuário e senha');
            }
        })
        return result;
    }

    async createSession(): Promise<boolean> {
        let result: boolean = false;
        await HttpClient.get({
            url: `${this.BASE_URL}authentication/session/new?api_key=${this.userCredentials.api_key}&request_token=${this.userCredentials.request_token}`,
            method: "GET"
        }).then((response: IResponse) => {
            this.userCredentials.session_id = response.session_id;
            result = true;
        }, (response: IResponseError) => {
            if (this.onError) {
                this.onError(response, 'Erro ao iniciar a sessão, verifique suas credenciais e tente novamente');
            }
        })
        return result;
    }

    async getAccountID(): Promise<boolean> {
        let result: boolean = false;
        await HttpClient.get({
            url: `${this.BASE_URL}account?api_key=${this.userCredentials.api_key}&session_id=${this.userCredentials.session_id}`,
            method: "GET"
        }).then((response: IResponse) => {
            this.userCredentials.account_id = response.id?.toString();
            result = true;
        }, (response: IResponseError) => {
            if (this.onError) {
                this.onError(response, 'Erro ao consultar o ID da Conta, verifique suas credenciais e tente novamente');
            }
        })
        return result;
    }

    async createList(name: string, description: string): Promise<number> {
        let result = -1;
        await HttpClient.get({
            url: `${this.BASE_URL}list?api_key=${this.userCredentials.api_key}&session_id=${this.userCredentials.session_id}`,
            method: "POST",
            body: {
                name,
                description,
                language: "pt-br"
            }
        }).then((response: IResponse) => {
            if (response.list_id) {
                result = response.list_id;
            }
        }, (response: IResponseError) => {
            if (this.onError) {
                this.onError(response, 'Erro ao incluir a Lista');
            }
        })
        return result;
    }

    async getCreatedLists(account_id?: string): Promise<Array<IMovieList>> {
        let result: Array<IMovieList> = [];
        await HttpClient.get({
            url: `${this.BASE_URL}account/${account_id}/lists?api_key=${this.userCredentials.api_key}&session_id=${this.userCredentials.session_id}`,
            method: "GET"
        }).then((response: IResponse) => {
            if (response.results) {
                result = (response.results as Array<IMovieList>);
            }
        }, (response: IResponseError) => {
            if (this.onError) {
                this.onError(response, 'Erro obter as Listas');
            }
        })
        return result;
    }

    async searchMovie(query: string): Promise<IMovieList> {
        let result: IMovieList = {
            id: 0,
            name: '',
            description: '',
            items: []
        };
        query = encodeURI(query);
        await HttpClient.get({
            url: `${this.BASE_URL}search/movie?api_key=${this.userCredentials.api_key}&&language=pt-BR&query=${query}`,
            method: "GET"
        }).then((response: IResponse) => {
            if (response.results) {
                result.items = (response.results as Array<IMovie>);
            }
        }, (response: IResponseError) => {
            if (this.onError) {
                this.onError(response, 'Erro pesquisar filme');
            }
        })
        return result;
    }

    async addMovieToList(movie_id: number, list_id: number): Promise<boolean> {
        let result = false;
        await HttpClient.get({
            url: `${this.BASE_URL}list/${list_id}/add_item?api_key=${this.userCredentials.api_key}&session_id=${this.userCredentials.session_id}`,
            method: "POST",
            body: {
                media_id: movie_id
            }
        }).then((response: IResponse) => {
            result = true;
        }, (response: IResponseError) => {
            // 403 = already added
            if (response.status !== 403) {
                if (this.onError) {
                    this.onError(response, 'Erro adicionar filme na lista');
                }
            }
        })
        return result;
    }

    async deleteMovieFromList(movie_id: number, list_id: number): Promise<boolean> {
        let result = false;
        await HttpClient.get({
            url: `${this.BASE_URL}list/${list_id}/remove_item?api_key=${this.userCredentials.api_key}&session_id=${this.userCredentials.session_id}`,
            method: "POST",
            body: {
                media_id: movie_id
            }
        }).then((response: IResponse) => {
            result = true;
        }, (response: IResponseError) => {
            if (this.onError) {
                this.onError(response, 'Erro adicionar filme na lista');
            }
        })
        return result;
    }

    async getMovieList(list_id: number): Promise<Array<IMovie>> {
        let result: Array<IMovie> = [];
        await HttpClient.get({
            url: `${this.BASE_URL}list/${list_id}?api_key=${this.userCredentials.api_key}&language=pt-BR`,
            method: "GET"
        }).then((response: IResponse) => {
            if (response.items) {
                result = (response.items as Array<IMovie>);
            }
        }, (response: IResponseError) => {
            if (this.onError) {
                this.onError(response, 'Erro pesquisar filme');
            }
        })
        return result;
    }

}