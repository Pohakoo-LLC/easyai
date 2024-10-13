"use client";
import doRequest from "@/components/doRequest";
import Spinner from "@/components/spinner";
import { useEffect, useState } from "react";
import { reqStatus } from "@/components/doRequest";
import Button from "@/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";

export default function Home() {

    const [projects, setProjectsList] = useState<string[]|undefined>(undefined)
    const [clickedNewProject, setClickedNewProject] = useState<boolean>(false)
    const [projectName, setProjectName] = useState<string>("")
    const [newProjectResult, setNewProjectResult] = useState<reqStatus>(reqStatus.unsent)

    useEffect(() => {
        doRequest({url: 'get_projects', reqmethod: 'GET'})
        .then((data) => {
            setProjectsList(data['data'])
        })
    }, [])
    

    const handleCreateNewProject = () => {
        setNewProjectResult(reqStatus.waiting)
        doRequest({url: 'new_project', data: {"data":projectName}})
        .then((res) => {
            setNewProjectResult(res['data']);
            if (res['data'] === "completed") {
                window.location.href = `/project?id=${projectName}`;
            }
        })
        .catch((err) => {alert(err);return})
    }

    const handleDeleteProject = (projectName:string) => {
        doRequest({url: 'delete_project', data: {"data":projectName}})
        .then((res) => {
            if (res['data'] === 'completed') {
                setProjectsList(projects?.filter((project) => project !== projectName))
            }
            else {
                alert('Error deleting project!')
            }
        })
    }

    return (
        <div className="w-full h-full block">
            <div className="w-full h-fit p-3 mt-4 flex items-center justify-center">
                <div className="text-center text-4xl font-semibold text-white mt-[15vh]">
                    Easy AI GUI
                </div>
            </div>
            <div className="w-full h-fit p-3 mt-4 flex items-center justify-center space-x-3">
                <Button onClick={()=>{setClickedNewProject(true)}} className={"w-48 h-48 flex items-center justify-center text-center"} enabled={!clickedNewProject}>
                    {
                        !clickedNewProject ?
                        <div>New Project</div>
                        :
                        <div className="block w-full h-fit p-0 mx-2 items-center justify-center">
                            <input type="text" placeholder="Project name" value={projectName} onChange={(e)=>{setProjectName(e.target.value)}} className="w-full p-1 text-black rounded shadow"></input>
                            <div className="h-10 flex justify-center" onClick={handleCreateNewProject}>
                                {
                                    newProjectResult === reqStatus.unsent ?
                                    projectName.length > 0 && <div className="bg-gray-700 px-2 py-1 w-1/2 h-fit mt-1 rounded cursor-pointer duration-100 border border-gray-500 hover:bg-gray-600">Create</div>
                                    :
                                    newProjectResult === reqStatus.waiting ?
                                    <div className="m-2"><Spinner/></div>
                                    :
                                    newProjectResult != reqStatus.completed && <>{`Server error: ${newProjectResult}`}</>
                                }
                            </div>
                        </div>
                    }
                </Button>
                <Button className="overflow-y-auto w-48 h-48" enabled={false}>
                    <div className="block">
                        <div className="flex w-full h-fit text-center px-2 py-1 pt-1 mb-2 text-gray-300 font-semibold">
                            Open project...
                        </div>
                        {
                            <>
                                {
                                    projects ?
                                        (
                                            projects.length > 0 ?
                                            <div className="">
                                                {
                                                    projects.map((project, key) => {
                                                        return (
                                                            <div className="flex w-full h-fit text-center items-center px-2 py-0.5 bg-gray-700 cursor-pointer duration-100 hover:bg-gray-600" key={key} onClick={(target) => {
                                                                if ((target as any).target.tagName === 'svg' || (target as any).target.tagName === 'path') return;
                                                                window.location.href = `/project?id=${project}`;
                                                            }}>
                                                                {project}
                                                                <FontAwesomeIcon icon={faTrash} className="ml-auto opacity-50 duration-100 hover:opacity-75" onClick={()=>{handleDeleteProject(project)}} />
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                            :
                                            <div className="flex w-full h-fit text-center px-2 py-0.5 flex justify-center">
                                                No previous projects!
                                            </div>
                                        )
                                    :
                                    <div className="w-full h-fit flex justify-center">
                                        <Spinner/>
                                    </div>
                                }
                            </>
                        }
                    </div>
                </Button>
            </div>
        </div>
    )
}
