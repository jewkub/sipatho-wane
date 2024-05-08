<script lang="ts">
	import { PUBLIC_BACKEND_HOSTNAME } from '$env/static/public'
	import { fulltime } from '../doctorList'
	import { Form, Input, Label, Button, Container } from '@sveltestrap/sveltestrap'
	import hospitalList from '../hospitalList'
	const type = 'frozen-out'
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
		<Label for="requestName">ชื่อผู้ขอแลก</Label>
		<Input class="mb-3" type="select" id="requestName" name="requestName" required>
			<option disabled selected value="">เลือก</option>
			{#each fulltime as e}
				<option value={e}>{e}</option>
			{/each}
		</Input>
		<Label for="date">วันที่</Label>
		<Input class="mb-3" type="date" placeholder="วันที่" id="date" name="date" required/>
		<Label for="detail">รายละเอียด</Label>
		<Input class="mb-3" type="textarea" id="detail" name="detail" required/>
		<div class="mb-3">
			<Button type="submit" color="primary" outline>Submit</Button>
		</div>
	</Form>
</Container>
