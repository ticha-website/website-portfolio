const closeButtonId = 'modal-close-button';
const modalId = 'modal';
const backdropId = 'backdrop';

function transformResponseToText(response: Response): Promise<string> {
    return response.text();
}

function clickCloseModalHandler(event: Event): void {

    const modalElement = document.getElementById(modalId);
    const backdropElement = document.getElementById(backdropId);
    const closeButtonElement = document.getElementById(closeButtonId);

    if (!modalElement || !backdropElement || !closeButtonElement) {
        return;
    }

    const srcElement = event.target as HTMLElement;
    if (srcElement.tagName === 'DIV' && srcElement.id === 'modal-close') {
        modalElement.remove();
        backdropElement.remove();
        document.body.classList.remove('modal-open');
    } else if (srcElement === closeButtonElement) {
        modalElement.remove();
        backdropElement.remove();
        document.body.classList.remove('modal-open');
    }
}

function registerCloseModalListener(): void {
    const closeButtonElement = document.getElementById(closeButtonId);
    const closeModalElement = document.getElementById('modal-close');

    if (!closeButtonElement || !closeModalElement) {
        return;
    }

    closeButtonElement.addEventListener('click', clickCloseModalHandler);
    closeModalElement.addEventListener('click', clickCloseModalHandler);
}

function openModal(title: string, body: string): void {
	const closeButtonHtml = `
		<button id="${closeButtonId}" type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>
	`;

    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop', 'fade', 'show');
    backdrop.id = backdropId;

	const modalHtml = `
		<div id="modal-close" class="modal" tabindex="-1" role="dialog" style="display: block;">
		  <div class="modal-dialog modal-dialog-scrollable modal-xl modal-dialog-centered" role="document">
		    <div class="modal-content">
		      <div class="modal-header">
		        <h4 class="modal-title">${title}</h4>
		        ${closeButtonHtml}
		      </div>
		      <div class="modal-body">${body}</div>
	      </div>
		  </div>
	  </div>
	`;

	const element = document.createElement('div');
	element.innerHTML = modalHtml;
	element.id = modalId;

	document.body.appendChild(element);
	document.body.classList.add('modal-open');
    document.body.appendChild(backdrop);

	registerCloseModalListener();
}

function parseContentForModal(content: string): void {
    const parser = new DOMParser();

    const html = parser.parseFromString(content, 'text/html');
    const pageTitle = html.getElementById('page-title');
    const pageBody = html.getElementById('page-body');

    if (!pageTitle || !pageBody) {
        return;
    }

	// ToDo: Come up with better solution from type perspective
	const textContent = pageTitle.textContent || '';

	openModal(textContent, pageBody.innerHTML);
}

function clickOpenModalHandler(event: Event): void {
	event.preventDefault();

	//@ts-ignore
	const url = event.target.href;

	fetch(url).then(transformResponseToText).then(parseContentForModal);
}

export function modal(buttonElementName: string): void {
	const buttonElements = document.getElementsByClassName(buttonElementName);

	//@ts-ignore
	for (const buttonElement of buttonElements) {
		buttonElement.addEventListener("click", clickOpenModalHandler);
	}
}
