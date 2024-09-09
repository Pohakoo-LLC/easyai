import { LayerTypes } from "@/app/project/page"
import { projConfigType } from "@/app/project/page";
import Button from "./button";

type Props = {
    setProjectConfig: (config:projConfigType)=>void,
    projectConfig: projConfigType,
    id: number,
    layerData: projConfigType['hidden_layers'][0]
}

export function listToString(list: number[]) {
    return list ? list.map(num => num === 0 ? '' : num.toString()).join(',') : '0';
}

export default function LayerCustomizer({setProjectConfig, projectConfig, id, layerData}:Props) {
    const LayerTypesList = Object.values(LayerTypes)
    function insertLayer(id: number, defaultSize:number[] = [100]) {
        let newConfig = projectConfig;
        newConfig.hidden_layers.splice(id, 0, {"size": defaultSize, "type": LayerTypes.dense});
        setProjectConfig({...newConfig});
    }
    function deleteLayer(id: number) {
        let newConfig = projectConfig;
        if (newConfig.hidden_layers.length > 1) {
            newConfig.hidden_layers.splice(id, 1);
            setProjectConfig({...newConfig});
        }
    }
    function stringToList(str: string) {
        return str.replace(/[^0-9,]/g, '').split(',').map(num => num === '' ? 0 : parseInt(num));
    }
    return (
        <div className="w-full px-2 py-1 bg-white border rounded mt-2 shadow block justify-center space-y-0.5">
            <div className='flex justify-center w-full font-semibold mb-2'>{`Hidden layer ${id+1}`}</div>
            <div className='w-full flex justify-center'>
                <div className="whitespace-nowrap">Dimensions (seperate with comma): </div>
                <input type='text' 
                    maxLength={50} 
                    className='rounded border border-gray-400 ml-2 w-[10em] text-center px-1' 
                    value={listToString(projectConfig.hidden_layers[id].size)}
                    onChange={(t) => {
                        const target = t.target as HTMLInputElement;
                        let newConfig = projectConfig;
                        newConfig.hidden_layers[id].size = stringToList(target.value);
                        setProjectConfig({...newConfig});
                }}/>
            </div>
            <div className='flex justify-center w-full'>{`Type: `}
                <select className='rounded border border-gray-400 ml-2 w-fit min-w-[5em] px-1' value={projectConfig.hidden_layers[id]?.type} onChange={(t) => {
                    const target = t.target as HTMLSelectElement;
                    let newConfig = projectConfig;
                    newConfig.hidden_layers[id]!.type = target.value as LayerTypes;
                    setProjectConfig({...newConfig});
                }}>
                    {
                        LayerTypesList.map((layerType, id)=> {
                            return (
                                <option value={layerType} key={id}>{layerType}</option>
                            )
                        })
                    }
                </select>
            </div>
            <div className='flex justify-center max-w-full space-x-2'>
                <>
                    {
                        projectConfig.hidden_layers[id]?.type == LayerTypes.conv &&
                        <div className='flex justify-center w-full'>{`Filters: `}
                            <input 
                                type='text' 
                                maxLength={4} 
                                className='rounded border border-gray-400 ml-1 w-[4em] px-1' 
                                value={projectConfig.hidden_layers[id].config ? projectConfig.hidden_layers[id].config?.filters : 0} 
                                onChange={(t) => {
                                    const target = t.target as HTMLInputElement;
                                    let newConfig = projectConfig;
                                    if (!newConfig.hidden_layers[id].config) {
                                        newConfig.hidden_layers[id].config = {};
                                    }
                                    newConfig.hidden_layers[id].config.filters = parseInt(target.value) ? parseInt(target.value) : 0;
                                    setProjectConfig({...newConfig});
                                }}
                            />
                        </div>
                    }
                    {
                        projectConfig.hidden_layers[id]?.type == LayerTypes.conv &&
                        <div className='flex justify-center w-full'>{`Activation: `}
                            <select className='rounded border border-gray-400 ml-1 w-fit min-w-[5em] px-1' value={projectConfig.hidden_layers[id].config?.activation} onChange={(t) => {
                                const target = t.target as HTMLSelectElement;
                                let newConfig = projectConfig;
                                if (!newConfig.hidden_layers[id].config) {
                                    newConfig.hidden_layers[id].config = {};
                                }
                                newConfig.hidden_layers[id].config.activation = target.value as "sig"|"ReLU"|"linear"|"Softmax";
                                setProjectConfig({...newConfig});
                            }}>
                                <option value={undefined}>Select</option>
                                <option value="sig">Sigmoid</option>
                                <option value="ReLU">ReLU</option>
                                <option value="linear">Linear</option>
                                <option value="Softmax">Softmax</option>
                            </select>
                        </div>
                    }
                    {
                        projectConfig.hidden_layers[id]?.type == LayerTypes.conv &&
                        <div className='flex justify-center w-full'>{`Transpose: `}
                            <input type='checkbox' className='rounded border border-gray-400 w-5 ml-1 px-1' checked={projectConfig.hidden_layers[id].config?.transpose} onChange={(t) => {
                                const target = t.target as HTMLInputElement;
                                let newConfig = projectConfig;
                                if (!newConfig.hidden_layers[id].config) {
                                    newConfig.hidden_layers[id].config = {};
                                }
                                newConfig.hidden_layers[id].config.transpose = target.checked;
                                setProjectConfig({...newConfig});
                            }}/>
                        </div>
                    }
                </>
            </div>
            <div className='flex justify-center w-full h-fit space-x-1'>
                <Button className='px-1' variation={3} onClick={()=>{insertLayer(id-1, layerData.size)}}>Add layer before</Button>
                <Button className='px-1' variation={3} onClick={()=>{insertLayer(id+1, layerData.size)}}>Add layer after</Button>
            </div>
            <div className='flex justify-center w-full h-fit space-x-1 pt-1'>
                <Button className='px-1' variation={3} onClick={()=>{deleteLayer(id)}} enabled={projectConfig.hidden_layers.length > 1}>Remove</Button>
            </div>
        </div>
    )
}