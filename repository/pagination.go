package repository

type Paging struct {
	pageSize   int
	pageNumber int
}

func NewPaging(items int) Paging {
	return Paging{items, 1}
}

func NewDefaultPaging() Paging {
	return Paging{50, 1}
}

func (p *Paging) Offset() int {
	return (p.pageNumber - 1) * p.pageSize
}

func (p *Paging) Next() {
	p.pageNumber += 1
}

func (p *Paging) Prev() {
	if p.pageNumber > 0 {
		p.pageNumber -= 1
	}
}
