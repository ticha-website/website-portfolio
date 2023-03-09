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
	const responseElementSent = document.getElementById("successfully-send");
	const responseElementNotOk = document.getElementById("not-send");

	if (!responseElementSent || !responseElementNotOk || !responseElementNotOk.dataset?.messages) {
		return;
	}

	const messages = JSON.parse(responseElementNotOk.dataset.messages) as Record<string, string>;

	console.log(messages);

	if (response.ok) {
		responseElementSent.classList.remove('d-none');
		responseElementNotOk.classList.add('d-none');

		formElement.replaceChildren();

	} else {
		responseElementNotOk.classList.remove('d-none');

		try {
			const error = (await response.json()) as string;
			responseElementNotOk.innerText = messages[error];
		} catch (error) {
			console.error(error);
		}
		//@ts-ignore
		formElement.elements.namedItem('submit').classList.remove('disabled');
	}

	formElement.insertBefore(responseElementSent, formElement.firstChild);
}

async function clickSubmitHandler(event: Event, formElement: HTMLFormElement): Promise<void> {
	if (!formElement.reportValidity()) {
		return;
	}

	event.preventDefault();
	//@ts-ignore
	event.target.classList.add('disabled');

	let result: Response;

	try {
		result = await extractAndSendForm(formElement);
	} catch (error) {
		result = error as Response;
	}
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
