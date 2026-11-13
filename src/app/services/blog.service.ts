// src/app/services/blog.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, docData } from '@angular/fire/firestore';
import { Post } from '../models/posts.models';
import { PostCollection } from '../models/cms-site.model';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private firestore = inject(Firestore);

  posts = signal<Post[]>([]);

  constructor() {
    console.log('BlogService initialized');
    this.getPosts('posts').subscribe(posts => {
      console.log('Loaded posts:', posts);
      this.posts.set(posts);
    });
  }

  getPosts(collectionName: PostCollection = 'posts'): Observable<Post[]> {
    console.log(`Fetching all posts from ${collectionName}`);
    const targetCollection = collection(this.firestore, collectionName);
    return collectionData(targetCollection, { idField: 'id' }).pipe(
      map((posts: any[]) => posts.map(post => post as Post)),
      tap(posts => console.log(`Posts from Firestore (${collectionName}):`, posts))
    ) as Observable<Post[]>;
  }

  getPostById(id: string, collectionName: PostCollection = 'posts'): Observable<Post | undefined> {
    console.log(`Fetching post with ID: ${id} from ${collectionName}`);
    const postDoc = doc(this.firestore, `${collectionName}/${id}`);
    return docData(postDoc, { idField: 'id' }).pipe(
      map(post => {
        if (!post) {
          throw new Error('Post not found');
        }
        return post as Post;
      }),
      tap(post => console.log('Retrieved post:', post))
    ) as Observable<Post>;
  }

  async deletePost(id: string, collectionName: PostCollection = 'posts'): Promise<void> {
    const postDoc = doc(this.firestore, `${collectionName}/${id}`);
    return deleteDoc(postDoc);
  }
}
