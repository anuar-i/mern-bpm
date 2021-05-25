import React, {useCallback, useContext, useEffect, useState} from 'react';
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";
import {useMessage} from "../hooks/message.hook";
import {useParams} from "react-router-dom";
const xml2js = require('xml2js');

export function BpmnModelerPage({ isEdit }) {
  const [diagram, setDiagram] = useState('');
  const { token } = useContext(AuthContext);
  const { request } = useHttp();
  const message = useMessage();
  const processId = useParams().id;
  const container = document.getElementById("container");
  const modeler = new Modeler({
    container,
    keyboard: {
      bindTo: document
    }
  });

  useEffect(() => {
    if (isEdit) {
      fetchProcess();
    }
  }, []);

  useEffect(() => {
    if (!isEdit) {
      if (diagram.length === 0) {
        fetchDefaultProcess();
      }
    }
  }, []);

  const fetchSaveProcess = useCallback(async (process) => {
    try {
      const fetched = await request('/api/process', 'POST', {process}, {
        Authorization: `Bearer ${token}`
      })

      if (fetched) {
        message(fetched.message);
      }
    } catch (e) {}
  }, [token, request])

  const fetchProcess = useCallback(async () => {
    try {
      const fetched = await request(`/api/process/${processId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      });

      const builder = new xml2js.Builder();

      const processXml = builder.buildObject(JSON.parse(fetched.process));

      console.log(processXml)
      setDiagram(processXml);
    } catch (e) {}
  }, [token, request])

  const fetchDefaultProcess = useCallback(async () => {
    try {
      const fetched = await request(`/api/default`, 'GET', null, {
        Authorization: `Bearer ${token}`
      });

      console.log(fetched);
      setDiagram(fetched.defaultProcess);
    } catch (e) {}
  }, [token, request])

  if (diagram.length > 0) {
    modeler
      .importXML(diagram)
      .then(({ warnings }) => {
        if (warnings.length) {
          console.log("Warnings", warnings);
        }

        const canvas = modeler.get("modeling");
        canvas.setColor("CalmCustomerTask", {
          stroke: "green",
          fill: "yellow"
        });
      })
      .catch((err) => {
        console.log("error", err);
      });
  }

  function saveXML() {
    modeler.saveXML().then(({ xml }) => {
      const { parseString } = xml2js;

      parseString(xml, (err, json) => {
        if (err) {
          console.error(err);
        }

        fetchSaveProcess(JSON.stringify(json));
      });
    });
  }

  return (
    <div className="bpmn-modeler">
      <div
        id="container"
        style={{
          border: "1px solid #000000",
          height: "90vh",
          width: "90vw",
          margin: "auto"
        }}
      />
      <a
        download='list.txt'
        onClick={saveXML}
      >
        Save process
      </a>
    </div>
  );
}
