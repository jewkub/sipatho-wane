<script lang="ts">
	import { PUBLIC_BACKEND_HOSTNAME } from '$env/static/public'
	import { fulltime } from '../doctorList'
	import { Form, Input, Label, Button, Container } from 'sveltestrap'
	import hospitalList from '../hospitalList'
	const type = 'frozen'
	const hospital = hospitalList[type]!
	const frozenGroup = [
		'Frozen ทั่วไป คิว 1',
		'Frozen ทั่วไป คิว 2',
		'Gyne frozen',
		'OR Neuro frozen',
		'OR Ortho (Bone/Soft tissue)',
	]
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
		<Label for="group">กอง frozen</Label>
		<Input class="mb-3" type="select" id="group" name="group" required>
			<option disabled selected value="">เลือก</option>
			{#each frozenGroup as e}
				<option value={e}>{e}</option>
			{/each}
		</Input>
		<Label for="responseName">ชื่อผู้รับแลก</Label>
		<Input class="mb-3" type="select" id="responseName" name="responseName" required>
			<option disabled selected value="">เลือก</option>
			{#each fulltime as e}
				<option value={e}>{e}</option>
			{/each}
		</Input>
		<div class="mb-3">
			<Button type="submit" color="primary" outline>Submit</Button>
		</div>
	</Form>
</Container>
