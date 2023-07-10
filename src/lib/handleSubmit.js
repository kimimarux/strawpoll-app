import { addDoc, collection } from 'firebase/firestore';
import { browser } from '$app/environment';

function showAlert(message) {
	if (browser) {
		alert(message);
	}
}

export async function handleSubmit(db, questionT, optionsT) {
	if (questionT === '') {
		showAlert('Please enter a question');
		return;
	}

	//function (item) {
	//	return item.value;
	//}

	const hasOption = optionsT.some((item) => {
		return item.value !== '';
	});

	if (!hasOption) {
		showAlert('Please enter at least one option');
		return;
	}

	const poll = {
		question: questionT,
		options: optionsT
			.filter((item) => item.value !== '')
			.map((item) => ({ name: item.value, votes: 0 }))
	};

	await addDoc(collection(db, 'polls'), poll);

	console.log('Poll saved:', poll);

	questionT = '';
	optionsT = [{ value: '' }];
}
