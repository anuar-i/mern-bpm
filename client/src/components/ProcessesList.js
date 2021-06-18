import React from 'react'
import {Link} from 'react-router-dom'

export const ProcessesList = ({ processes = [] }) => {
  if (!processes.length) {
    return <p className="center">Процессов пока нет</p>
  }

  return (
    <table>
      <thead>
      <tr>
        <th>№</th>
        <th>Open</th>
      </tr>
      </thead>

      <tbody>
      { processes.map((process, index) => {
        console.log(process)
        return (
          <tr key={process._id}>
            <td>{index + 1}</td>
            <td>
              <Link to={`/edit/${process._id}`}>Открыть</Link>
            </td>
          </tr>
        )
      }) }
      </tbody>
    </table>
  )
}
