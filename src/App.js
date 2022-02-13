import preview from './preview.png'
import './App.css';
import S3 from 'react-aws-s3'
import { config, url } from './config'
import { useEffect, useState } from 'react';

function App() {
  window.Buffer = window.Buffer || require("buffer").Buffer;

  const [im, setIm] = useState([])

  // jank logic to parse s3's xml response that lists images
  useEffect(() => {
    fetch(url).then((res) => {
      res.text().then(text => {
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'text/xml')
        let nodes = xml.querySelector('ListBucketResult').querySelectorAll('Contents')
        let prevImages = [];
        nodes.forEach((el) => prevImages.push(el['childNodes'].item(0).innerHTML))
        setIm(prevImages.slice().reverse())
      })
    }).catch(err => console.log(err))
  }, [])

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

  const go = () => {
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

  const deleteImage = (e) => {
    if (window.confirm('Delete this fine snip?')) {
      const splat = e.target.src.split("/")
      s3Client.deleteFile(splat[splat.length - 1])
        .then(res => console.log(res))
        .catch(err => console.log(err))
    }
  }

  return (
    <>
      <div className="container bg-gray-200 rounded-lg flex-auto mx-auto">
        <h1 className="text-2xl mt-2 ml-2 font-gray-500">Paste an image and I'll fire it up to your S3 bucket, Luke</h1>
        <img className="mt-2 ml-2" id="preview" src={preview} />
        <button className="bg-blue-500 hover:bg-blue-700 mb-4 text-white font-bold py-2 px-4 rounded-full mt-8 ml-8" onClick={go}>Go</button>
      </div>

      <div className="container bg-gray-200 rounded-lg flex-auto mx-auto">
        <h1 className="text-2xl mt-2 ml-2 font-gray-500">Your last 5 snips, click to delete:</h1>
        <div>
          {im.slice(0, 5).map((i, k) => {
            return <>
              <img onClick={deleteImage} className="mb-2 ml-2" key={k} alt={`prev image ${k}`} src={`${url}/${i}`} />
              <br />
            </>
          })}
        </div>
      </div>
    </>
  );
}

export default App;
