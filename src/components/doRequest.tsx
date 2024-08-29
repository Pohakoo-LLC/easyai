interface reqProps {
    url: string;
    data?: {'data': string|any[]|any};
    reqmethod?: 'GET'|'POST';
}

const doRequest = async ({url, reqmethod='POST', data={"data":"NONE"}}:reqProps) : Promise<{"data":any}> => {
    const BACKEND_URL = 'http://127.0.0.1:5000/'

    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
        url = BACKEND_URL + url
    }
    try {
        const response = await fetch(url, {
            method: reqmethod,
            headers: {
                'Content-Type': 'application/json'
            },
            body: reqmethod == 'POST' ? JSON.stringify(data) : undefined
        });
        if (!response.ok) {
            throw new Error('Request failed');
        }
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error:', error);
        alert('Error:' + error)
        throw error;
    }
}

export default doRequest
export enum reqStatus {
    unsent = "unsent",
    waiting = "waiting",
    completed = "completed",
    error = "error"
    
}