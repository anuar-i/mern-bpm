import React from 'react'
import {Link} from 'react-router-dom'

export const SidebarMenu = ({ processes = [] }) => {
  if (!processes.length) {
    return <p className="center">Процессов пока нет</p>
  }

  return (
    <ul>
      Processes
      { processes.map((process, index) => {
        return (
          <li key={`${index}-${process._id}`}>
            <div className="menu-item">
              <span>Process - {index}</span>&nbsp;&nbsp;&nbsp;
              <Link to={`/edit/${process._id}`}>Open</Link>
            </div>
          </li>
        )
      }) }
    </ul>
  )
}
