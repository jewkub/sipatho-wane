<script lang="ts">
	import { onMount } from 'svelte'
	import { OptionList } from '../optionList'
	import { PUBLIC_BACKEND_HOSTNAME } from '$env/static/public'
	import { Order } from '../order'
	import OrderList from '../Order.svelte'
	import { Form, Input, Label, Button, Col, Row, Container, Accordion, AccordionItem } from 'sveltestrap'
	const type = 'full-autopsy'
</script>

<svelte:head>
	<title>Full-time off autopsy - แลกเวรพาโถ</title>
	<meta name="description" content="About this app" />
</svelte:head>

<Container>
	<h1>แลกเวร - Full-time off autopsy</h1>
	<Form action="{PUBLIC_BACKEND_HOSTNAME + 'add'}" method="post" enctype="application/x-www-form-urlencoded">
		<Input value={type} style="display: none;" type="text" name="type" readonly required/>
		<Input class="mb-3" type="textarea" placeholder="กรอกข้อมูล" name="details" required/>
		<div class="mb-3">
			<Button type="submit" color="primary" outline>Submit</Button>
		</div>
	</Form>
</Container>
