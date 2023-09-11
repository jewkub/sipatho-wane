export class Order {
  active: boolean = true
  index: number
  requestDate: string = ''
  responseDate: string = ''
  subspe: string = ''
  requestTitle: string = 'ผู้ขอแลก'
  responseTitle: string = 'ผู้รับแลก'
  requestName: string = ''
  responseName: string = ''
  orderTitle: string = ''

  constructor (index: number) {
    this.index = index
    this.orderTitle = '# ' + index
  }
}
