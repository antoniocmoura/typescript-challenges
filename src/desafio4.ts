import { IMovieList, IListItems, IResponseError, IMovie, MENU_STATE } from "./interfaces.js";
import TheMovieDB from "./themoviedb.js";
import { showAlert } from "./alert.js";

const BASE_URL = 'https://api.themoviedb.org/3/';

const body = document.getElementsByTagName('body')[0]! as HTMLElement;
const spinner = document.getElementById('spinner')! as HTMLElement;
const formLogin = document.getElementById('form-login')! as HTMLFormElement;
const formList = document.getElementById('form-list')! as HTMLElement;
const inputListName = document.getElementById('input-list-name')! as HTMLInputElement;
const inputListDescription = document.getElementById('input-list-description')! as HTMLTextAreaElement;
const inputSearch = document.getElementById('input-search')! as HTMLInputElement;
const buttonSearch = document.getElementById('button-search')! as HTMLElement;
const userList = document.getElementById('user-lists')! as HTMLElement;
const movieList = document.getElementById('movie-list')! as HTMLElement;

let menuState = MENU_STATE.Invisible;

const theMovieDB = new TheMovieDB(BASE_URL, { username: '', password: '', api_key: '' }, showError);

let listItems: IListItems = {
    items: []
}

/* LISTENERS */

const formLoginListener = () => {
    formLogin.addEventListener('submit', async (event: Event) => {
        event.preventDefault();
        theMovieDB.userCredentials.username = (document.getElementById('login__username')! as HTMLInputElement).value;
        theMovieDB.userCredentials.password = (document.getElementById('login__password')! as HTMLInputElement).value;
        theMovieDB.userCredentials.api_key = (document.getElementById('login__apikey')! as HTMLInputElement).value;
        showSpinner()
        try {
            if (await theMovieDB.login()) {
                await showApp();
            }
        } finally {
            hideSpinner();
        }
    })
}

const bodyListener = () => {
    body.addEventListener('click', (event: MouseEvent) => {
        if (menuState === MENU_STATE.Visible) {
            if (!clickInsideElement(event, 'list-menu')) {
                hideListMenu();
            }
        }
    })
}

const buttonSearchListener = () => {
    buttonSearch.addEventListener('click', async (event: MouseEvent) => {
        event.preventDefault();
        showSpinner();
        try {
            movieList.innerHTML = '';
            let movies: IMovieList = await theMovieDB.searchMovie(inputSearch.value);
            showMovies(movies);
            inputSearch.value = '';
        } finally {
            hideSpinner()
        }
    })
}

const formListListener = () => {
    formList.addEventListener('submit', async (event: Event) => {
        event.preventDefault();
        showSpinner();
        try {
            let list_id = await theMovieDB.createList(inputListName.value, inputListDescription.value);
            if (list_id > 0) {
                let userList: IMovieList = {
                    id: list_id,
                    name: inputListName.value,
                    description: inputListDescription.value,
                    items: []
                }
                listItems.items.push(userList);
                inputListName.value = '';
                inputListDescription.value = '';
                showCreatedLists();
            }
        } finally {
            hideSpinner();
        }
    })
}

const keyboardListener = () => {
    window.onkeyup = function (event: KeyboardEvent) {
        if ((menuState === MENU_STATE.Visible) && (event.key === 'Escape')) {
            hideListMenu();
        }
    }
}

/* FUNCTIONS */

function showError(responseError: IResponseError, defaultError: string) {
    let errorDescription: string;
    if (responseError.statusText)
        errorDescription = responseError.statusText
    else
        errorDescription = defaultError;
    errorDescription += '(' + responseError.status.toString() + ')';
    showAlert({ type: 'error', title: 'Erro', message: errorDescription, button_text: 'OK' });
}

function showSpinner() {
    setTimeout(() => { spinner.classList.remove('hidden') }, 0);
}

function hideSpinner() {
    setTimeout(() => { spinner.classList.add('hidden') }, 0);
}

async function loadCreatedLists() {
    let createdLists = await theMovieDB.getCreatedLists(theMovieDB.userCredentials.account_id);
    if (createdLists) {
        for (const item of createdLists) {
            let listItem: IMovieList = {
                id: item.id,
                name: item.name,
                description: item.description,
                items: await theMovieDB.getMovieList(item.id)
            }
            listItems.items.push(listItem);
        }
        showCreatedLists();
    }
}

function clickInsideElement(event: MouseEvent, className: string) {
    var el = event.target as HTMLElement;
    if (el.classList.contains(className)) {
        return el;
    } else {
        while ((el.parentNode) && (el = el.parentNode as HTMLElement)) {
            if (el.classList && el.classList.contains(className)) {
                return el;
            }
        }
    }
    return false;
}

function showMovies(movies: IMovieList) {
    movieList.innerHTML = '';
    movies.items.forEach((movie) => {
        let movieImg = document.createElement('img');
        if (movie.poster_path) {
            movieImg.src = 'https://image.tmdb.org/t/p/w154/' + movie.poster_path;
        } else {
            movieImg.src = '../img/no_image_holder.svg';
        }

        let imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        imageContainer.appendChild(movieImg);

        let movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        movieContainer.appendChild(imageContainer);
        movieContainer.appendChild(document.createTextNode(movie.original_title.trim()));

        movieContainer.addEventListener('click', (mouseEvent: MouseEvent) => {
            mouseEvent.stopPropagation();
            if (movies.id === 0) {
                showAddListMenu(mouseEvent, movie);
            } else {
                showDeleteListMenu(mouseEvent, movieContainer, movie, movies);
            }
        })

        movieList.classList.remove('hidden');
        movieList.appendChild(movieContainer);
    })
}

function hideListMenu() {
    let listMenu = document.getElementById('list-menu');
    if (listMenu) {
        listMenu.classList.remove('list-menu--active');
        body.removeChild(listMenu);
    }
}

function showDeleteListMenu(event: MouseEvent, movieContainer: HTMLElement, movie: IMovie, list: IMovieList) {
    hideListMenu();

    let menuTitle = document.createElement('span');
    menuTitle.classList.add('menu-title');
    menuTitle.appendChild(document.createTextNode('REMOVER FILME DA LISTA'));

    let menuItems = document.createElement('ul');
    menuItems.classList.add('menu-items');

    let listMenu = document.createElement('nav');
    listMenu.classList.add('list-menu');
    listMenu.id = 'list-menu';
    listMenu.appendChild(menuTitle);
    listMenu.appendChild(menuItems);

    let menuItem = document.createElement('li');
    menuItem.classList.add('menu-item');
    let itemName = document.createTextNode(list.name);
    let itemContainer = document.createElement('span');
    itemContainer.classList.add('menu-item-link');
    itemContainer.appendChild(itemName);
    itemContainer.addEventListener('click', async () => {
        showSpinner();
        try {
              if (await theMovieDB.deleteMovieFromList(movie.id, list.id)) {
                  list.items = list.items.filter( (item) => {
                      return item.id !== movie.id;
                  } )
                  let list_item = document.getElementById('list-item-' + list.id)! as HTMLElement;
                  list_item.innerText = list.name + ` (${list.items.length})`;
                  movieList.removeChild(movieContainer);
              }
            hideListMenu();
        } finally {
            hideSpinner();
        }
    })
    menuItem.appendChild(itemContainer);
    menuItems.appendChild(menuItem);

    body.appendChild(listMenu);
    listMenu.classList.add('list-menu--active');
    positionMenu(event, listMenu);
    menuState = MENU_STATE.Visible;
}

function showAddListMenu(event: MouseEvent, movie: IMovie) {
    hideListMenu();

    let menuTitle = document.createElement('span');
    menuTitle.classList.add('menu-title');
    menuTitle.appendChild(document.createTextNode('SELECIONE UMA LISTA'));

    let menuItems = document.createElement('ul');
    menuItems.classList.add('menu-items');

    let listMenu = document.createElement('nav');
    listMenu.classList.add('list-menu');
    listMenu.id = 'list-menu';
    listMenu.appendChild(menuTitle);
    listMenu.appendChild(menuItems);

    listItems.items.forEach((item) => {
        let menuItem = document.createElement('li');
        menuItem.classList.add('menu-item');
        let itemName = document.createTextNode(item.name);
        let itemContainer = document.createElement('span');
        itemContainer.classList.add('menu-item-link');
        itemContainer.appendChild(itemName);
        itemContainer.addEventListener('click', async () => {
            showSpinner();
            try {
                if (await theMovieDB.addMovieToList(movie.id, item.id)) {
                    item.items.push(movie);
                    let list_item = document.getElementById('list-item-' + item.id)! as HTMLElement;
                    list_item.innerText = item.name + ` (${item.items.length})`
                }
                hideListMenu();
            } finally {
                hideSpinner();
            }
        })
        menuItem.appendChild(itemContainer);
        menuItems.appendChild(menuItem);
    });

    body.appendChild(listMenu);
    listMenu.classList.add('list-menu--active');
    positionMenu(event, listMenu);
    menuState = MENU_STATE.Visible;
}

function positionMenu(event: MouseEvent, menu: HTMLElement) {

    let menuWidth = menu.offsetWidth + 4;
    let menuHeight = menu.offsetHeight + 4;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    if ((windowWidth - event.clientX) < menuWidth) {
        menu.style.left = windowWidth - menuWidth + "px";
    } else {
        menu.style.left = event.clientX + "px";
    }

    if ((windowHeight - event.clientY) < menuHeight) {
        menu.style.top = windowHeight - menuHeight + "px";
    } else {
        menu.style.top = event.clientY + "px";
    }
}

async function showApp() {
    await loadCreatedLists();
    bodyListener();
    buttonSearchListener();
    formListListener();
    keyboardListener();
    document.getElementsByTagName('body')[0]?.classList.remove('align');
    document.getElementById('login-container')?.classList.add('hidden');
    document.getElementById('main-container')?.classList.remove('hidden');
    document.getElementById('main-container')?.classList.add('main-container');
    inputListName.focus();
}

function showCreatedLists() {
    userList.innerHTML = '';
    listItems.items.forEach((list_item) => {

        let itemName = document.createTextNode(list_item.name + ` (${list_item.items.length})`);
        let itemContainer = document.createElement('span');
        itemContainer.classList.add('list-item-text');
        itemContainer.appendChild(itemName);
        itemContainer.id = 'list-item-' + list_item.id;

        let itemDescription = document.createTextNode(list_item.description);
        let itemDescriptionContainer = document.createElement('span');
        itemDescriptionContainer.classList.add('list-item-description');
        itemDescriptionContainer.appendChild(itemDescription);

        let listItem = document.createElement('li');
        listItem.classList.add('list-item');
        listItem.appendChild(itemContainer);
        listItem.appendChild(itemDescriptionContainer);

        userList.appendChild(listItem);

        listItem.addEventListener('click', () => {
            showSpinner();
            try {
                showMovies(list_item);
            } finally {
                hideSpinner();
            }
        })

    })
}

function startApp() {
    formLoginListener();
};

startApp();