<script lang="ts">
	import { PUBLIC_BACKEND_HOSTNAME } from '$env/static/public'
	import { Form, Input, Label, Button, Col, Row, Container } from 'sveltestrap'
	import hospitalList from '../hospitalList'
	import { fulltime } from '../doctorList'
	const type = 'full-cyto'
	const hospital = hospitalList[type]
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
			{#each fulltime as e}
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
		<Label for="details">เหตุผล</Label>
		<Input class="mb-3" type="textarea" placeholder="รายละเอียด" id="details" name="details" required/>
		<div class="mb-3">
			<Button type="submit" color="primary" outline>Submit</Button>
		</div>
	</Form>
</Container>
