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
  }, [diagram]);

  const fetchSaveProcess = useCallback(async (process) => {
    try {
      const fetched = await request('/api/process', 'POST', {process}, {
        Authorization: `Bearer ${token}`
      })

      if (fetched) {
        message(fetched.message);
      }
    } catch (e) {}
  }, [token, request]);

  const fetchEditProcess = useCallback(async (process) => {
    try {
      const fetched = await request('/api/process', 'PUT', {processId, process}, {
        Authorization: `Bearer ${token}`
      });

      if (fetched) {
        message(fetched.message);
      }
    } catch (e) {}
  }, [token, request]);

  const fetchProcess = useCallback(async () => {
    try {
      const fetched = await request(`/api/process/${processId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      });

      const builder = new xml2js.Builder();

      const processXml = builder.buildObject(JSON.parse(fetched.process));

      setDiagram(processXml);
    } catch (e) {}
  }, [token, request])

  const fetchDefaultProcess = useCallback(async () => {
    try {
      const fetched = await request(`/api/default`, 'GET', null, {
        Authorization: `Bearer ${token}`
      });

      setDiagram(fetched.defaultProcess);
    } catch (e) {
      setDiagram(`<?xml version="1.0" encoding="UTF-8"?>
        <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_1">
          <bpmn:process id="Process_1" isExecutable="false">
            <bpmn:startEvent id="StartEvent_1"/>
          </bpmn:process>
          <bpmndi:BPMNDiagram id="BPMNDiagram_1">
            <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
              <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
                <dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>
              </bpmndi:BPMNShape>
            </bpmndi:BPMNPlane>
          </bpmndi:BPMNDiagram>
        </bpmn:definitions>`);
    }
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

  function saveXML(isDownload = false) {
    modeler.saveXML().then(({ xml }) => {
      const { parseString } = xml2js;

      parseString(xml, (err, json) => {
        if (err) {
          console.error(err);
        }

        if (isDownload) {
          download(JSON.stringify(json), 'file.txt');
          return;
        }

        if (isEdit) {
          fetchEditProcess(JSON.stringify(json))
        } else {
          fetchSaveProcess(JSON.stringify(json));
        }
      });
    });
  }

  function download(data, filename, type) {
    const file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      const a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
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
        className="save-link"
        download='list.txt'
        onClick={saveXML}
      >
        Save process
      </a>

      <a
        download='list.txt'
        onClick={() => saveXML(true)}
      >
        Download process
      </a>
    </div>
  );
}
