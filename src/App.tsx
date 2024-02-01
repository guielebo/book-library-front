import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

interface BookInterface {
  bookId: number
  title: string
  firstName: string
  lastName: string
  totalCopies: number
  copiesInUse: number
  type: string
  isbn: string
  category: string
}

interface BookRequestInterface {
  totalCount: number
  pageSize: number
  pageNumber: number
  items: BookInterface[]
}

const searchBy = {
  bookId: 'ID',
  title: 'Title',
  firstName: 'First name',
  lastName: 'Last name',
  totalCopies: 'Total of copies',
  copiesInUse: 'Copies in use',
  type: 'Type',
  isbn: 'ISBN',
  category: 'Category'
}

const URL_REQUEST = 'https://localhost:7117/book'

function App() {
  const [books, setBooks] = useState<BookRequestInterface>({
    items: [],
    totalCount: 0,
    pageSize: 0,
    pageNumber: 0
  })

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(2)
  const [termSearch, setTermSearch] = useState('')
  const [searchType, setSearchType] = useState('')
  const [error, setError] = useState(false)

  const pageItems = useMemo(() => {
    return Array.from(Array(books.pageSize)).map((i, index) => index + 1)
  }, [books.totalCount, limit])

  const handleChangeFilterOrPage = useCallback(({ nextPage, nextLimit, search, searchType }: { nextPage?: number; nextLimit?: number, search?: string; searchType?: string }) => {
    if (search !== undefined && search !== termSearch) {
      startTransition(() => {
        setPage(0)
        setTermSearch(search)
        setSearchType(searchType || '')
      })
    }
    else if (nextLimit !== undefined && nextLimit !== limit) {
      startTransition(() => {
        setPage(0)
        setLimit(nextLimit)
      })
    }
    else if (nextPage !== undefined && page !== nextPage && page <= books.pageSize) {
      setPage(nextPage)
    }
  }, [limit, page, termSearch])

  const fetchBooks = useCallback(async () => {
    try {
      const response = await fetch(URL_REQUEST + `?termSearch=${termSearch}&pageNumber=${page}&pageSize=${limit}&type=${searchType}`, { method: 'GET' })
      const data = await response.json() as BookRequestInterface
      startTransition(() => {
        setBooks(data)
        setError(false)
      })
    } catch (e) {
      setError(true)
    }
  }, [termSearch, limit, page])

  useEffect(() => {
    fetchBooks().then()
  }, [fetchBooks]);

  return (
    <div className="App">
      <form className={'box'} onSubmit={(e) => {
        e.preventDefault()

        const selectValue = document.querySelector<HTMLSelectElement>('[name="searchType"]')?.value as string
        const inputValue = document.querySelector<HTMLInputElement>('[name="searchTerm"]')?.value as string

        handleChangeFilterOrPage({ searchType: selectValue, search: inputValue })
      }}>
        <div className={'flex-column'}>
          <p>Search by:</p>
          <select name={'searchType'}>
            {(Object.keys(searchBy) as Array<keyof typeof searchBy>).map(key => <option value={key} key={key}>{searchBy[key]}</option>)}
          </select>
        </div>
        <div className={'flex-column'}>
          <p>Search by:</p>
          <input type={'text'} name={'searchTerm'} />
        </div>
        <button type={'submit'}>Search</button>
      </form>
      <div className={'box'}>
        <table>
          <thead>
            <tr>
              {(Object.keys(searchBy) as Array<keyof typeof searchBy>).map(key => <td key={key}>{searchBy[key]}</td>)}
            </tr>
          </thead>
          <tbody>
            {books.items.map(book => <tr>
              <td>{book.bookId}</td>
              <td>{book.title}</td>
              <td>{book.firstName}</td>
              <td>{book.lastName}</td>
              <td>{book.totalCopies}</td>
              <td>{book.copiesInUse}/{book.totalCopies}</td>
              <td>{book.type}</td>
              <td>{book.isbn}</td>
              <td>{book.category}</td>
            </tr>)}
          </tbody>
        </table>
        {error && <p>Request error, please try again or later!</p>}
        <div className={'pagination'}>
          {pageItems.map((item, index) => <button key={item} onClick={() => handleChangeFilterOrPage({ nextPage: index })}>{item}</button>)}
        </div>
      </div>
    </div>
  );
}

export default App;
