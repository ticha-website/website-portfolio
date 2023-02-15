function extractAndSendForm(formElement: HTMLFormElement): Promise<Response> {
	const url = formElement.action;

	const formData = new FormData(formElement);
	formData.append('isAjax', 'true');

	return fetch(url, {
		method: "post",
		body: formData,
	});
}

async function showResult(formElement: HTMLFormElement, response: Response): Promise<void> {
	const responseElement = document.createElement('p');
	responseElement.classList.add('alert');

	if (response.ok) {
		responseElement.classList.add('alert-success');
		responseElement.innerText = 'Thank you!';

		formElement.replaceChildren();
	} else {
		responseElement.classList.add('alert-danger');

		let content = 'Unknown error';

		try {
			content = await response.json();
		} catch (error) {
			console.error(error);
		}

		responseElement.innerText = content;
	}

	formElement.insertBefore(responseElement, formElement.firstChild);
}

async function clickSubmitHandler(event: Event, formElement: HTMLFormElement): Promise<void> {
	if (!formElement.reportValidity()) {
		return;
	}

	event.preventDefault();

	const result = await extractAndSendForm(formElement);

	await showResult(formElement, result);
}

export function contactForm(formElementId: string, submitElementId: string): void {
	const formElement = document.getElementById(formElementId);
	const submitElement = document.getElementById(submitElementId);

	if (!formElement || !submitElement) {
		return;
	}

	submitElement.addEventListener("click", (event: Event) => clickSubmitHandler(event, formElement as HTMLFormElement));
}
