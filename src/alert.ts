import { IAlert } from "./interfaces.js";

export const iconAlertError: string = '../img/error.svg';

export const showAlert = (Alert: IAlert) => {

    if (!Alert.img) {
        Alert.img = iconAlertError;
    }

    return new Promise(resolve => {
        const existingAlert = document.querySelector('.alert-wrapper');

        if (existingAlert) {
            existingAlert.remove();
        }

        const body = document.querySelector('body')! as HTMLBodyElement;

        const scripts = document.getElementsByTagName('script');

        let src = '';

        for (let script of scripts) {
            if (script.src.includes('cute-alert.js')) {
                src = script.src.substring(0, script.src.lastIndexOf('/'));
            }
        }

        let btnTemplate = `
      <button class="alert-button ${Alert.type}-bg ${Alert.type}-btn">${Alert.button_text}</button>
      `;

        if (Alert.type === 'question') {
            btnTemplate = `
        <div class="question-buttons">
          <button class="confirm-button ${Alert.type}-bg ${Alert.type}-btn">${Alert.confirm_text}</button>
          <button class="cancel-button error-bg error-btn">${Alert.cancel_text}</button>
        </div>
        `;
        }

        const template = `
       <div class="alert-wrapper">
        <div class="alert-frame">
          ${Alert.img !== '' ? '<div class="alert-header ' + Alert.type + '-bg">' : '<div>'}
            <span class="alert-close ${Alert.close_style === 'circle'
                ? 'alert-close-circle'
                : 'alert-close-default'
            }">X</span>
            ${Alert.img !== '' ? '<img class="alert-img" src="' + src + '/' + Alert.img + '" />' : ''}
          </div>
          <div class="alert-body">
            <span class="alert-title">${Alert.title}</span>
            <span class="alert-message">${Alert.message}</span>
            ${btnTemplate}
          </div>
        </div>
      </div>
      `;

        body.insertAdjacentHTML('afterend', template);

        const alertWrapper = document.querySelector('.alert-wrapper')! as HTMLElement;
        const alertFrame = document.querySelector('.alert-frame')! as HTMLElement;
        const alertClose = document.querySelector('.alert-close')! as HTMLElement;

        if (Alert.type === 'question') {
            const confirmButton = document.querySelector('.confirm-button')! as HTMLElement;;
            const cancelButton = document.querySelector('.cancel-button')! as HTMLElement;;

            confirmButton.addEventListener('click', () => {
                alertWrapper.remove();
                resolve('confirm');
            });

            cancelButton.addEventListener('click', () => {
                alertWrapper.remove();
                resolve('');
            });
        } else {
            const alertButton = document.querySelector('.alert-button')! as HTMLElement;;

            alertButton.addEventListener('click', () => {
                alertWrapper.remove();
                resolve('ok');
            });
        }

        alertClose.addEventListener('click', () => {
            alertWrapper.remove();
            resolve('close');
        });

        alertFrame.addEventListener('click', e => {
            e.stopPropagation();
        });
    });
};