import preview from './preview.png'
import './App.css';
import S3 from 'react-aws-s3'
import { config } from './config'

function App() {
  window.Buffer = window.Buffer || require("buffer").Buffer;


  const s3Client = new S3(config)

  document.onpaste = function (e) {
    const clipItems = (e.clipboardData.items)
    const items = [].slice.call(clipItems).filter(function (item) {
      return item.type.indexOf('image') !== -1;
    })

    if (items.length === 0) {
      return;
    }

    const item = items[0]
    const blob = item.getAsFile()

    document.getElementById('preview').src = URL.createObjectURL(blob);
  }

  const go = (e) => {
    if (document.getElementById('preview').src.includes('preview')) {
      alert('you are previewing you twat')
      return;
    } else {
      const imgEl = document.getElementById('preview')

      fetch(imgEl.src).then(res => res.blob()).then(blob => {
        s3Client.uploadFile(blob, `${Date.now()}_paste.png`)
          .then(data => {
            imgEl.src = preview

            navigator.clipboard.writeText(data.location)
            alert('copied to clipboard my g')
          })
          .catch(err => console.log(err))
      })


    }
  }

  return (
    <div className="container">
      <h1 className="text-2xl mt-2 ml-2 font-gray-500">Paste an image and I'll fire it up to your S3 bucket, Luke</h1>
      <img className="mt-2 ml-2" id="preview" src={preview} />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-8 ml-8" onClick={go}>Go</button>
    </div>
  );
}

export default App;
