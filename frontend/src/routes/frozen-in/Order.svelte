<script lang="ts">
  import { Input, Label, Button, Col, Row, AccordionItem } from '@sveltestrap/sveltestrap'
  import { fulltime } from '../doctorList'
  export let index: number
	const frozenGroup = [
		'Frozen ทั่วไป คิว 1',
		'Frozen ทั่วไป คิว 2',
		'Gyne frozen',
		'OR Neuro frozen',
		'OR Ortho (Bone/Soft tissue)',
	]
</script>

<div class="accordion-item">
	<h2 class="accordion-header">
		<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse{index}" aria-expanded="true" aria-controls="collapse{index}">
			#{index}
		</button>
	</h2>
	<div id="collapse{index}" class="accordion-collapse collapse" data-bs-parent="#accordion">
		<div class="accordion-body">
      <Label for="requestName">ชื่อผู้ขอแลก</Label>
      <Input class="mb-3" type="select" id="values[{index}][requestName]" name="values[{index}][requestName]" required>
        <option disabled selected value="">เลือก</option>
        {#each fulltime as e}
          <option value={e}>{e}</option>
        {/each}
      </Input>
      <Label for="requestDate">วันที่ต้องการแลก</Label>
      <Input class="mb-3" type="date" placeholder="วันที่ต้องการแลก" id="values[{index}][requestDate]" name="values[{index}][requestDate]" required/>
      <Label for="group">กอง frozen</Label>
      <Input class="mb-3" type="select" id="values[{index}][group]" name="values[{index}][group]" required>
        <option disabled selected value="">เลือก</option>
        {#each frozenGroup as e}
          <option value={e}>{e}</option>
        {/each}
      </Input>
      <Label for="responseName">ชื่อผู้รับแลก</Label>
      <Input class="mb-3" type="select" id="values[{index}][responseName]" name="values[{index}][responseName]" required>
        <option disabled selected value="">เลือก</option>
        {#each fulltime as e}
          <option value={e}>{e}</option>
        {/each}
      </Input>
      <Label for="responseDate">วันที่ต้องการอยู่</Label>
      <Input class="mb-3" type="date" placeholder="วันที่ต้องการอยู่" id="values[{index}][responseDate]" name="values[{index}][responseDate]" required/>
    </div>
  </div>
</div>