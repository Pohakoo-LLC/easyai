"use client";
import doRequest from "@/components/doRequest";
import Spinner from "@/components/spinner";
import { useEffect, useState } from "react";

export default function Home() {

    const [projects, setProjectsList] = useState<string[]|undefined>(undefined)

    useEffect(() => {
        doRequest({url: 'get_projects', reqmethod: 'GET'})
        .then((data) => {
            setProjectsList(data['data'])
        })
    }, [])

    return (
        <div className="w-full h-full block">
            <div className="w-full h-fit p-3 mt-4 flex items-center justify-center">
                <div className="text-center text-4xl font-semibold text-white mt-[15vh]">
                    Easy AI GUI
                </div>
            </div>
            <div className="w-full h-fit p-3 mt-4 flex items-center justify-center space-x-3">
                <div className="w-48 h-48 bg-gray-700 block rounded-lg text-white font-semibold shadow duration-100 border border-gray-500 hover:scale-[99%] hover:bg-gray-600">
                    <div className="flex w-full h-full items-center justify-center text-center cursor-pointer">New Project</div>
                </div>
                <div className="w-48 h-48 block rounded-lg text-white shadow duration-100 border border-gray-500">
                    <div className="flex w-full h-fit text-center px-2 py-1 pt-1 mb-2 text-gray-300 font-semibold">
                        Open...
                    </div>
                    {
                        <>
                            {
                                projects ?
                                <>
                                    {
                                        projects.map((project, key) => {
                                            return (
                                                <div className="flex w-full h-fit text-center px-2 py-0.5 bg-gray-700 cursor-pointer duration-100 hover:bg-gray-600" key={key}>
                                                    {project}
                                                </div>
                                            )
                                        })
                                    }
                                </>
                                :
                                <div className="w-full h-fit flex justify-center">
                                    <Spinner/>
                                </div>
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    )
}
