import React, {useCallback, useContext, useEffect, useState} from 'react'
import {useHttp} from '../hooks/http.hook'
import {AuthContext} from '../context/AuthContext'
import {Loader} from '../components/Loader'
import {ProcessesList} from '../components/ProcessesList'

export const ProcessesPage = () => {
  const [processes, setProcesses] = useState([])
  const {loading, request} = useHttp()
  const {token} = useContext(AuthContext)

  const fetchProcesses = useCallback(async () => {
    try {
      return await request('/api/process', 'GET', null, {
        Authorization: `Bearer ${token}`
      })
    } catch (e) {}
  }, [token, request])

  useEffect(() => {
    fetchProcesses().then((res) => {
      setProcesses(res)
    })
  }, [fetchProcesses])

  if (loading) {
    return <Loader/>
  }

  return (
    <>
      {!loading && <ProcessesList processes={processes} />}
    </>
  )
}
