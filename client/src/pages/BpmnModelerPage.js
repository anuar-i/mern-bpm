import React, {useCallback, useContext, useEffect, useState} from 'react';
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";
import {useMessage} from "../hooks/message.hook";
import {useHistory, useParams} from "react-router-dom";
import {SidebarMenu} from "../components/SidebarMenu";
import {Loader} from "../components/Loader";
const xml2js = require('xml2js');

export function BpmnModelerPage({ isEdit, isCreate }) {
  const [diagram, setDiagram] = useState('');
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const { request } = useHttp();
  const message = useMessage();

  const processId = useParams().id;
  const container = document.getElementById("container");
  let modeler = new Modeler({
    container,
    keyboard: {
      bindTo: document
    }
  });

  const history = useHistory();

  useEffect(() => {
    if (isEdit) {
      fetchProcess(processId);
    }
  }, [isEdit]);

  useEffect(() => {
    if (isCreate) {
      fetchDefaultProcess();
    }
  }, [isCreate]);

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

  const fetchProcess = useCallback(async (id) => {
    try {
      const fetched = await request(`/api/process/${id}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      });

      const builder = new xml2js.Builder();

      const processXml = builder.buildObject(JSON.parse(fetched.process));

      setDiagram(processXml);
    } catch (e) {}
  }, [token, request])

  const fetchProcesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetched = await request('/api/process', 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      if (fetched) {
        setIsLoading(false);
      }

      return fetched;
    } catch (e) {
      setIsLoading(false)
      setProcesses([])
    }
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
    const length = document.querySelectorAll('.bjs-container').length;
    document.querySelectorAll('.bjs-container').forEach((container, index) => {
      if (length - 1 !== index) {
        container.remove();
      }
    });
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

        if (isEdit) {
          fetchEditProcess(JSON.stringify(json))
        } else {
          fetchSaveProcess(JSON.stringify(json));
        }

        fetchProcesses().then((res) => {
          setProcesses(res)
        })
      });
    });
  }

  function downloadXML() {
    modeler.saveXML().then(({ xml }) => {
      const { parseString } = xml2js;

      parseString(xml, (err, json) => {
        if (err) {
          console.error(err);
        }

        download(JSON.stringify(json), 'file.txt');
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

  useEffect(() => {
    fetchProcesses().then((res) => {
      setProcesses(res)
    })
  }, [fetchProcesses])

  console.log(isLoading)
  return (
    <div className="main-page">
      <aside className='sidebar-menu'>
        <div className="save-actions">
          <a
            className="save-link btn yellow darken-4"
            download='list.txt'
            onClick={saveXML}
          >
            Save process
          </a>

          <a
            className="btn yellow darken-4"
            download='list.txt'
            onClick={downloadXML}
          >
            Download process
          </a>
        </div>
        <button
          onClick={() => {
            history.push("/create");
          }}
          className="btn blue darken-4"
        >
          Create new process
        </button>
        { isLoading ? <Loader/> : <SidebarMenu processes={processes}/> }
      </aside>
      <main className="bpmn-modeler">
        <div
          id="container"
          style={{
            border: "1px solid #000000",
            height: "90vh",
            width: "90vw",
            margin: "auto"
          }}
        />
      </main>
    </div>
  );
}
