<script>
	export let items = [{ value: '' }];

	function handleInput(event, index) {
		if (index === items.length - 1 && event.target.value !== '') {
			items = [...items, { value: '' }];
		} else if (event.target.value === '' && items.length > 1) {
			items = items.filter((item, i) => i !== index);
		} else {
			items[index].value = event.target.value;
		}
	}

	function handleClick() {
		items = [{ value: '' }];
	}

	$: items, items; // $: { items = items; }
</script>

{#each items as item, index}
	<input
		type="text"
		id="textTest"
		bind:value={item.value}
		class="mt-4 w-1/6 flex-col rounded-md border border-slate-300 bg-white px-2 py-2 text-sm placeholder-gray-600 focus:border-sky-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
		on:input={(event) => handleInput(event, index)}
		placeholder={`Option ${index + 1}`}
	/>
{/each}

<button
	class="mt-4 rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
	on:click={handleClick}>reset</button
>
