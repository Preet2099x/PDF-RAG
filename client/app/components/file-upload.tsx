'use client';
import * as React from 'react';
import { Upload } from 'lucide-react';

const FileUploadComponent: React.FC = () => {

    const HandleFileUpload = ()=> {
        
        const el = document.createElement('input')
        el.setAttribute('type','file')
        el.setAttribute('accept','application/pdf')
        el.addEventListener('change',async (ev) => {
            if(el.files && el.files.length>0) {

                const file = el.files.item(0)
                
                if (file) {
                    const formData = new FormData()
                    formData.append('pdf',file) 

                    await fetch('http://localhost:8000/upload/pdf',{
                        method: 'POST',
                        body: formData
                    }) 
                }

                // console.log(el.files)
            }
        })
        el.click()


    }


    return (
        <div className="w-40 h-40 bg-slate-900 text-white shadow-xl rounded-lg border-2 border-white flex items-center justify-center">
            <button onClick={HandleFileUpload} className="flex flex-col items-center justify-center space-y-1 focus:outline-none">
                <Upload className="w-8 h-8 text-white" />
                <span className="text-xs font-medium">Upload PDF File</span>
            </button>
        </div>
    );
};

export default FileUploadComponent;
