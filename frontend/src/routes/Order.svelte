<script lang="ts">
	import { Input, Label, Button, Col, Row, AccordionItem } from 'sveltestrap';
	import { PUBLIC_BACKEND_HOSTNAME } from '$env/static/public';
  import type Order from './order'

  export let order: Order
	export let hospital: string

  const DateFormat = (date: string | number | Date) => new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		year: '2-digit',
		month: 'short',
	}).format(new Date(date))

	const updateText = (type: string, title: string, name: string, orderTitle?: string) => {
		if (type == 'req') {
			order.requestTitle = title
			order.requestName = name
		}
		else if (type == 'res') {
			order.responseTitle = title
			order.responseName = name
		}
		if (orderTitle == undefined) order.orderTitle = `# ${order.index}`
		else order.orderTitle = orderTitle
	}

  const handleChange = async (type: string) => {
		try {
			if (type == 'req') {
				if (!order.requestDate || !order.subspe) return updateText('req', `ผู้ขอแลก`, '')
				order.requestTitle = `ผู้ขอแลก - ⏳`
				const getName = await (await fetch(new URL('/name?' + new URLSearchParams({
					hospital,
					date: order.requestDate,
					subspe: order.subspe,
				}), PUBLIC_BACKEND_HOSTNAME))).text()
				if (getName == 'N/A') return updateText('req', `ผู้ขอแลก - [ไม่พบ]`, '')
				const orderTitle = order.responseName ? `# ${order.index}: ${getName.split(' ')[0]}, ${DateFormat(order.requestDate)} ↔ ${order.responseName.split(' ')[0]}, ${DateFormat(order.responseDate)}` : undefined
				return updateText('req', `ผู้ขอแลก - ${getName}`, getName, orderTitle)
			}
			else if (type == 'res') {
				if (!order.responseDate || !order.subspe) return updateText('res', `ผู้รับแลก`, '')
				order.responseTitle = `ผู้รับแลก - ⏳`
				const getName = await (await fetch(new URL('/name?' + new URLSearchParams({
					hospital,
					date: order.responseDate,
					subspe: order.subspe,
				}), PUBLIC_BACKEND_HOSTNAME))).text()
				if (getName == 'N/A') return updateText('res', `ผู้รับแลก - [ไม่พบ]`, '')
				const orderTitle = order.requestName ? `# ${order.index}: ${order.requestName.split(' ')[0]}, ${DateFormat(order.requestDate)} ↔ ${getName.split(' ')[0]}, ${DateFormat(order.responseDate)}` : undefined
				return updateText('res', `ผู้รับแลก - ${getName}`, getName, orderTitle)
			}
		} catch (e) {
			console.error(e)
		}
	}

	const getSubspeList = async () => {
		const subspeList = await fetch(new URL('/subspelist', PUBLIC_BACKEND_HOSTNAME))
		const options = (await subspeList.json())[hospital]
		if (!Array.isArray(options)) throw new Error('subspe list is not array')
		if (new Set(options).size !== options.length) throw new Error('duplicate subspe')
		return options
	}
</script>

<div class="accordion-item">
	<h2 class="accordion-header">
		<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse{order.index}" aria-expanded="true" aria-controls="collapse{order.index}">
			{order.orderTitle}
		</button>
	</h2>
	<div id="collapse{order.index}" class="accordion-collapse collapse" data-bs-parent="#accordion">
		<div class="accordion-body">
			<h5 style="color: blue">{order.requestTitle}</h5>
			<Row cols={{xs: 1, md: 2}}>
				<Col class="mb-3">
					<Label for="request{order.index}Date">วันที่</Label>
					<Input bind:value={order.requestDate} on:change={() => handleChange('req')} type="date" name="values[{order.index}][requestDate]" id="request{order.index}Date" required/>
				</Col>
				<Col class="mb-3">
					<Label for="request{order.index}Subspe">subspe</Label>
					<select class="form-select" bind:value={order.subspe} on:change={() => {handleChange('req');handleChange('res')}} name="values[{order.index}][requestSubspe]" id="request{order.index}Subspe" required>
						<option disabled selected value="">เลือก sub</option>
						{#await getSubspeList()}
							<option disabled value="-">Loading...</option>
						{:then options}
							{#each options as option (option)}
								<option value="{option}">{option}</option>
							{/each}
						{:catch error}
							<option disabled value="-">error</option>
							<p style="display: none;">{error}</p>
						{/await}
					</select>
				</Col>
			</Row>
			<Input value={order.requestName.split(' ')[0]} type="text" class="form-control" name="values[{order.index}][requestName]" id="request${order.index}Name" style="display: none;"/>
			<hr/>
			<h5 style="color: orange">{order.responseTitle}</h5>
			<Row cols={{xs: 1, md: 2}}>
				<Col class="mb-3">
					<Label for="response{order.index}Date">วันที่</Label>
					<Input bind:value={order.responseDate} on:change={() => handleChange('res')} type="date" name="values[{order.index}][responseDate]" id="response{order.index}Date" required/>
				</Col>
				<Col class="mb-3">
					<Label for="response{order.index}Subspe">subspe</Label>
					<select class="form-select" bind:value={order.subspe} on:change={() => {handleChange('req');handleChange('res')}} name="values[{order.index}][responseSubspe]" id="response{order.index}Subspe" required>
						<option disabled selected value="">เลือก sub</option>
						{#await getSubspeList()}
							<option disabled value="-">Loading...</option>
						{:then options}
							{#each options as option (option)}
								<option value="{option}">{option}</option>
							{/each}
						{:catch error}
							<option disabled value="-">error</option>
							<p style="display: none;">{error}</p>
						{/await}
					</select>
				</Col>
			</Row>
			<Input value={order.responseName.split(' ')[0]} type="text" class="form-control" name="values[{order.index}][responseName]" id="response{order.index}Name" style="display: none;"/>
		</div>
	</div>
</div>
