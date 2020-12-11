import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FileItem } from '../models/file-item';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {

  private CARPETA_IMAGENS = 'img';

  constructor(private db: AngularFirestore) {
    
  }

  cargarImagenesFirebase(imagenes: FileItem[]){
    // console.log(imagenes);
    const storageRef = firebase.default.storage().ref();

    for(const item of imagenes){
      item.estaSubiendo = true;
      if(item.progreso>=100){
        continue;
      }

      const uploadTask: firebase.default.storage.UploadTask = storageRef.child(`${this.CARPETA_IMAGENS}/${item.nombreArchivo}`)
                                                                        .put(item.archivo);
      uploadTask.on(firebase.default.storage.TaskEvent.STATE_CHANGED,
          (snapshot: firebase.default.storage.UploadTaskSnapshot)=>item.progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          (error)=>console.error('Error al subir: ', error),
          ()=>{
            console.log('Imagen cargada correctamente');
            //item.url = uploadTask.snapshot.downloadURL;
            //item.estaSubiendo = false;
            //this.guardarImagen({nombre: item.nombreArchivo, url: item.url});
            uploadTask.snapshot.ref.getDownloadURL().then(getUrl=>{
              item.url = getUrl;
              this.guardarImagen({
                nombre: item.nombreArchivo,
                url: item.url
              });
            });
          }
      );

    }

  }

  private guardarImagen(imagen: { nombre: string, url: string }){
    this.db.collection(`/${this.CARPETA_IMAGENS}`).doc().set(imagen);
  }
}
