const closeButtonId = 'modal-close-button';
const modalId = 'modal';

function transformResponseToText(response: Response): Promise<string> {
	return response.text();
}

function clickCloseModalHandler(event: Event): void {
	event.preventDefault();

	document.body.classList.remove('modal-open');
	const modalElement = document.getElementById(modalId);

	if (!modalElement) {
		return;
	}

	modalElement.remove();
}

function registerCloseModalListener(): void {
	const closeButtonElement = document.getElementById(closeButtonId);

	if(!closeButtonElement) {
		return;
	}

	closeButtonElement.addEventListener("click", clickCloseModalHandler);
}

function openModal(title: string, body: string): void {
	const closeButtonHtml = `
		<button id="${closeButtonId}" type="button" class="close" data-dismiss="modal" aria-label="Close">
	    <span aria-hidden="true">&times;</span>
	  </button>
	`;

	const modalHtml = `
		<div class="modal" tabindex="-1" role="dialog" style="display: block;">
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

	registerCloseModalListener();
}

function parseContentForModal(content: string): void {
	const parser = new DOMParser();

	const html = parser.parseFromString(content, "text/html");
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
