<script lang="ts">
	import { PUBLIC_BACKEND_HOSTNAME } from '$env/static/public'
	import { Form, Input, Button, Container, Row, Col, Label } from '@sveltestrap/sveltestrap'
	import { parttime } from '../doctorList'
	import optionList from '../optionList'
	import hospitalList from '../hospitalList'
	const type = 'part-off'
	const hospital = hospitalList[type]!
</script>

<svelte:head>
	<title>{hospital} - แลกเวรพาโถ</title>
	<meta name="description" content="About this app" />
</svelte:head>

<Container>
	<h1>แลกเวร - {hospital}</h1>
	<Form action="{PUBLIC_BACKEND_HOSTNAME + 'add'}" method="post" enctype="application/x-www-form-urlencoded">
		<Input value={hospital} style="display: none;" type="text" name="hospital" readonly required/>
		<Label for="name">ชื่อ</Label>
		<Input class="mb-3" type="select" id="name" name="name" required>
			<option disabled selected value="">เลือก</option>
			{#each parttime as e}
				<option value={e}>{e}</option>
			{/each}
		</Input>
		<Row cols={{xs: 1, md: 2}}>
			<Col class="mb-3">
				<Label for="startDate">วันเริ่ม</Label>
				<Input type="date" placeholder="วันเริ่ม" id="startDate" name="startDate" required/>
			</Col>
			<Col class="mb-3">
				<Label for="endDate">วันสิ้นสุด</Label>
				<Input type="date" placeholder="วันสิ้นสุด" id="endDate" name="endDate" required/>
			</Col>
		</Row>
		<Label for="subspe">subspe</Label>
		<Input class="mb-3" type="select" id="subspe" name="subspe" required>
			<option disabled selected value="">เลือก</option>
			{#each optionList as e}
				<option value={e}>{e}</option>
			{/each}
		</Input>
		<div class="mb-3">
			<Button type="submit" color="primary" outline>Submit</Button>
		</div>
	</Form>
</Container>
