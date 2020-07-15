import { Component, OnInit,Input,ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { Params,ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import {DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
 

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {
    
  feedbackForm:FormGroup;
  comment:Comment;
  @ViewChild('f1form') feedbackFormDirective;
  dish:Dish;
  dishIds: string[];
  prev: string;
  next: string;
  errMess: string;
  dishcopy: Dish;
  
  formErrors={
    'author':'',
     
    'comment':''
  }
  validationMessages ={
    'author':  {
      'required':'name is required',
      'minlength':'name should be atleast 2 characters',
      'maxlength':'name should be less than 25 characters'
  
      },
      
      'comment':{
        'required':'comment is required',
  
      }
    };
    
    constructor(private dishService:DishService,
    private location:Location,
    private route:ActivatedRoute,private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { this.createForm();}

  ngOnInit(): void{
  this.dishService.getDishIds()
   .subscribe((dishIds) => this.dishIds = dishIds);
   
  this.route.params
   .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
   .subscribe(dish => {this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id);},
      errmess => this.errMess = <any>errmess);
  }

  createForm(){
    
    this.feedbackForm=this.fb.group({
      author:['',[Validators.required,Validators.minLength(2),Validators.maxLength(25)]],
      rating:'0',
      comment:['',[Validators.required]],
      date:new Date().toISOString()

    });
    this.feedbackForm.valueChanges
    .subscribe(data=>this.onValueChanged(data));
  this.onValueChanged();
    
  }
  onValueChanged(data?:any){
    if(!this.feedbackForm){
      return;
    }
    const form=this.feedbackForm;
    for(const field in this.formErrors){
      if(this.formErrors.hasOwnProperty(field)){
        this.formErrors[field]='';
        const control=form.get(field);
        if(control && control.dirty && control.invalid){
          const messages=this.validationMessages [field];
          for(const key in control.errors){
            
            if(control.errors.hasOwnProperty(key)){
              this.formErrors[field]+=messages[key]+'';
            }
          }
        }
      }
    }
  }
  onSubmit(){
    this.comment=this.feedbackForm.value;
    console.log(this.comment.rating.valueOf());
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
        .subscribe(dish => {
          this.dish =dish;
          this.dishcopy=dish;},
          errmess => {this.dish = null; this.dishcopy = null; this.errMess = <any>errmess;});

        console.log(this.comment);
    this.feedbackForm.reset({
      author:'',
      rating:'',
      comment:'',
      date:''
    });
    this.feedbackFormDirective.resetForm();

  }
  

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }


  goBack(){
    this.location.back();
  }

}
