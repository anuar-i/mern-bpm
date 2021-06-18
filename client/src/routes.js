import React from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'
import {ProcessesPage} from './pages/ProcessesPage'
import {DetailPage} from './pages/DetailPage'
import {AuthPage} from './pages/AuthPage'
import {BpmnModelerPage} from "./pages/BpmnModelerPage";

export const useRoutes = isAuthenticated => {
  if (isAuthenticated) {
    return (
      <Switch>
        <Route path="/processes" exact>
          <ProcessesPage />
        </Route>
        <Route path="/create" exact>
          <BpmnModelerPage/>
        </Route>
        <Route path="/edit/:id" exact>
          <BpmnModelerPage isEdit={true} />
        </Route>
        <Route path="/detail/:id">
          <DetailPage />
        </Route>
        <Redirect to="/create" />
      </Switch>
    )
  }

  return (
    <Switch>
      <Route path="/" exact>
        <AuthPage />
      </Route>
      <Redirect to="/" />
    </Switch>
  )
}
