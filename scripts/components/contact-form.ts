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
	const responseElement = document.getElementById("successfully-send");
	const responseElementNotOk = document.getElementById("not-send")

	if (!responseElement || !responseElementNotOk) {
		return;
	}


	if (response.ok) {
		responseElement.classList.remove('d-none');
		responseElementNotOk.classList.add('d-none');

		formElement.replaceChildren();

	} else {
		responseElementNotOk.classList.remove('d-none');

		try {
			responseElementNotOk.innerText = await response.json();
		} catch (error) {
			console.error(error);
		}
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
