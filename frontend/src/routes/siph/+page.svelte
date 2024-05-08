<script lang="ts">
	import { onMount } from 'svelte'
	import { PUBLIC_BACKEND_HOSTNAME } from '$env/static/public'
	import Order from '../order'
	import OrderList from '../Order.svelte'
	import { Form, Input, Button, Container, Accordion } from '@sveltestrap/sveltestrap'
	import hospitalList from '../hospitalList'
  
	const hospital = hospitalList['siph']!
	let list: Order[] = []

	const add = () => {
		list.forEach((e, i) => {
			e.active = false
		})
		let order = new Order(list.length + 1)
		list.push(order)
		list = list
	}

	const remove = () => {
		if (list.length == 0) throw new Error('cannot remove empty list')
		list.pop()
		list = list
	}

	onMount(() => {
		add()
	})
</script>

<svelte:head>
	<title>{hospital} - แลกเวรพาโถ</title>
	<meta name="description" content="About this app" />
</svelte:head>

<Container>
	<h1>แลกเวร - {hospital}</h1>
	<Form action="{PUBLIC_BACKEND_HOSTNAME + 'add'}" method="post" enctype="application/x-www-form-urlencoded">
		<Input type="text" value={hospital} style="display: none;" name="hospital" readonly required />
		<div class="accordion mb-3" id="accordion">
			{#each list as e (e.index)}
				<OrderList order={e} hospital={hospital}/>
			{/each}
		</div>
		<div class="mb-3">
			<Button type="button" color="secondary" on:click={add} outline>+</Button>
			<Button type="button" color="secondary" on:click={remove} disabled={list.length == 0} outline={list.length != 0}>-</Button>
			<Button type="submit" color={list.length == 0 ? "secondary" : "primary"} disabled={list.length == 0} outline={list.length != 0}>Submit</Button>
		</div>
	</Form>
</Container>
