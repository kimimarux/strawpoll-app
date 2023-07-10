<script>
	import { initializeApp } from 'firebase/app';
	import { firebaseConfig } from '../lib/firebaseConfig';
	import {
		getFirestore,
		collection,
		getDocs,
		addDoc,
		onSnapshot,
		updateDoc,
		arrayUnion,
		doc,
		increment,
		runTransaction
	} from 'firebase/firestore';
	import InputList from '../components/InputList.svelte';
	import { handleSubmit } from '../lib/handleSubmit';

	let polls = [];
	let questionT = '';
	let optionsT = [{ value: '' }];
	let currentPollIndex = 0;
	let selectedOption = '';

	const app = initializeApp(firebaseConfig);
	const db = getFirestore(app);

	const pollsCollection = collection(db, 'polls');
	const unsubscribe = onSnapshot(pollsCollection, (querySnapshot) => {
		polls = [];
		querySnapshot.forEach((doc) => {
			polls.push({ id: doc.id, ...doc.data() });
		});
	});

	function showNextPoll() {
		currentPollIndex = (currentPollIndex + 1) % polls.length;
	}

	async function logPolls() {
		const querySnapshot = await getDocs(collection(db, 'polls'));
		for (const doc of querySnapshot.docs) {
			console.log(doc.id, doc.data());
		}
	}

	async function handleVote(event) {
		event.preventDefault();
		if (selectedOption) {
			const pollRef = doc(db, 'polls', polls[currentPollIndex].id);
			await runTransaction(db, async (transaction) => {
				const pollDoc = await transaction.get(pollRef);
				if (pollDoc.exists()) {
					const pollData = pollDoc.data();
					const optionIndex = pollData.options.findIndex(
						(option) => option.name === selectedOption
					);
					if (optionIndex !== -1) {
						const newVotes = pollData.options[optionIndex].votes + 1;
						const newOptions = [...pollData.options];
						newOptions[optionIndex] = { ...newOptions[optionIndex], votes: newVotes };
						transaction.update(pollRef, { options: newOptions });
					}
				}
			});
		}
	}
</script>

<div class="flex flex-col items-center justify-center">
	<button on:click|preventDefault={logPolls}>Log Polls</button>
	<label for="iText" class="my-4 justify-start text-2xl font-bold">Question</label>
	<input
		type="text"
		id="iText"
		class="-rounded-md mt-1 w-1/5 border border-slate-300 bg-white px-2 py-2 text-sm placeholder-gray-600 focus:border-sky-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
		bind:value={questionT}
		placeholder="What is your Question?"
	/>
	<div class="mt-4 text-2xl font-bold">Options</div>
	<InputList bind:inputFields={optionsT} />

	<div class="my-24" />

	{#if questionT !== ''}
		<div class="my-4 max-w-sm overflow-hidden rounded shadow-lg">
			<div class="px-6 py-4">
				<div class="mb-2 text-center text-xl font-bold">{questionT}</div>
				<ul>
					{#each optionsT as inputField, index}
						{#if inputField.value !== ''}
							<li class="text-base text-gray-700">•{inputField.value}</li>
						{/if}
					{/each}
				</ul>
			</div>
		</div>
	{/if}

	<button
		class="mt-4 rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		on:click|preventDefault={handleSubmit(db, questionT, optionsT)}>Create Poll</button
	>

	<div class="flex flex-col items-center justify-center">
		{#if polls.length > 0}
			<div class="my-4 flex items-start">
				<div class="max-w-sm overflow-hidden rounded shadow-lg">
					<div class="px-6 py-4">
						<div class="mb-2 text-center text-xl font-bold">{polls[currentPollIndex].question}</div>
						<form on:submit|preventDefault={handleVote}>
							{#each polls[currentPollIndex].options as option}
								<label class="block font-bold text-gray-700">
									<input
										type="radio"
										name="option"
										bind:group={selectedOption}
										value={option.name}
									/>
									{option.name}
								</label>
							{/each}
							<button
								class="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
								type="submit"
							>
								Vote
							</button>
						</form>
					</div>
				</div>
				<button
					class="ml-4 text-gray-700 hover:text-gray-900"
					on:click|preventDefault={showNextPoll}
				>
					Other Poll
				</button>
			</div>
		{/if}
	</div>
</div>
