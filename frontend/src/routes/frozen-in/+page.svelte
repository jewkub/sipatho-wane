<script lang="ts">
	import { PUBLIC_BACKEND_HOSTNAME } from '$env/static/public'
	import { Form, Input, Label, Button, Container } from 'sveltestrap'
	import hospitalList from '../hospitalList'
	import Order from './Order.svelte'
	const type = 'frozen-in'
	const hospital = hospitalList[type]!
	let length = 1
	const add = () => {
		length++
	}
	const remove = () => {
		if (length == 0) throw new Error('cannot remove empty list')
		length--
	}
</script>

<svelte:head>
	<title>{hospital} - แลกเวรพาโถ</title>
	<meta name="description" content="About this app" />
</svelte:head>

<Container>
	<h1>แลกเวร - {hospital}</h1>
	<Form action="{PUBLIC_BACKEND_HOSTNAME + 'add'}" method="post" enctype="application/x-www-form-urlencoded">
		<Input value={hospital} style="display: none;" type="text" name="hospital" readonly required/>
		<div class="accordion mb-3" id="accordion">
			{#each {length: length} as _, i}
				<Order index={i+1}/>
			{/each}
		</div>
		<div class="mb-3">
			<Button type="button" color="secondary" on:click={add} outline>+</Button>
			<Button type="button" color="secondary" on:click={remove} disabled={length == 0} outline={length != 0}>-</Button>
			<Button type="submit" color={length == 0 ? "secondary" : "primary"} disabled={length == 0} outline={length != 0}>Submit</Button>
		</div>
	</Form>
</Container>
