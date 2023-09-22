<script lang="ts">
	import { Input, Label, Button, Col, Row, AccordionItem } from 'sveltestrap';
  import OptionList from './optionList'
	import { PUBLIC_BACKEND_HOSTNAME } from '$env/static/public';
  import type Order from './order'

  export let order: Order
	export let hospital: string

  const DateFormat = (date: string | number | Date) => new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		year: '2-digit',
		month: 'short',
	}).format(new Date(date))

  const handleChange = async (type: string) => {
		try {
			if (type == 'req') {
				if (!order.requestDate || !order.subspe) {
					console.log(order.requestDate);
					console.log(order.subspe);
					order.requestTitle = `ผู้ขอแลก`
					order.requestName = ''
					order.orderTitle = `# ${order.index}`
					return ;
				}
				order.requestTitle = `ผู้ขอแลก - ⏳`
				const getName = await (await fetch(new URL('/name?' + new URLSearchParams({
					hospital,
					date: order.requestDate,
					subspe: order.subspe,
				}), PUBLIC_BACKEND_HOSTNAME))).text()
				if (getName == 'N/A') {
					order.requestTitle = `ผู้ขอแลก - [ไม่พบ]`
					order.requestName = ''
					order.orderTitle = `# ${order.index}`;
					return ;
				}
				order.requestTitle = `ผู้ขอแลก - ${getName}`
				order.requestName = getName
				if (order.responseName) order.orderTitle = `# ${order.index}: ${getName}, ${DateFormat(order.requestDate)} ↔ ${order.responseName}, ${DateFormat(order.responseDate)}`
			}
			else if (type == 'res') {
				if (!order.responseDate || !order.subspe) {
					order.responseTitle = `ผู้รับแลก`
					order.responseName = ''
					order.orderTitle = `# ${order.index}`
					return ;
				}
				order.responseTitle = `ผู้รับแลก - ⏳`
				const getName = await (await fetch(new URL('/name?' + new URLSearchParams({
					hospital,
					date: order.responseDate,
					subspe: order.subspe,
				}), PUBLIC_BACKEND_HOSTNAME))).text()
				if (getName == 'N/A') {
					order.responseTitle = `ผู้รับแลก - [ไม่พบ]`
					order.responseName = ''
					order.orderTitle = `# ${order.index}`
					return ;
				}
				order.responseTitle = `ผู้รับแลก - ${getName}`
				order.responseName = getName
				if (order.requestName) order.orderTitle = `# ${order.index}: ${order.requestName}, ${DateFormat(order.requestDate)} ↔ ${getName}, ${DateFormat(order.responseDate)}`
			}
		} catch (e) {
			console.error(e)
		}
	}

</script>

<AccordionItem header={order.orderTitle} active={order.active}>
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
        {#each OptionList as option (option)}
          <option value="{option}">{option}</option>
        {/each}
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
        {#each OptionList as option (option)}
          <option value="{option}">{option}</option>
        {/each}
			</select>
    </Col>
  </Row>
  <Input value={order.responseName.split(' ')[0]} type="text" class="form-control" name="values[{order.index}][responseName]" id="response{order.index}Name" style="display: none;"/>
</AccordionItem>
