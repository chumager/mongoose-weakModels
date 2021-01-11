"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.weakModels=weakModels,exports.plugin=void 0;var _mongooseMutex=_interopRequireDefault(require("@chumager/mongoose-mutex")),_promiseHelpers=require("@chumager/promise-helpers"),_lodash=_interopRequireDefault(require("lodash.merge"));function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}class localPromise extends Promise{}let lock;(0,_promiseHelpers.promiseHelpers)(localPromise);const plugin=async(e,t={})=>{if(!t.name)throw new Error("option.name is needed to create new weak Model");if(!t.db)throw new Error("option.db is needed to create new weak Model");let{name:o}=t;const{db:a,itdfw:i}=t;delete t.name,delete t.db,delete t.itdfw;const s=[];e.childSchemas.forEach(({schema:e,model:t})=>{t.$isArraySubdocument&&e.set("weakModel")&&s.push({subSchema:e,model:t})}),await Promise.all(s.map(async({subSchema:s,model:n})=>{const{path:r}=n,l=`${o}_${r}`,d=s.set("weakModel");let c;switch(typeof d){case"function":c=await d(s,e,a);break;case"object":c=await d;break;case"boolean":c={}}(0,_lodash.default)(c,t);const{projection:p={},statics:m,methods:u,post:h,extraFields:w,collation:f,position:_,preAggregate:$,postAggregate:b,total:g,set:y,applyPlugins:k=!0,parentName:M}=c,P=o.toLowerCase();if(s.weakModelName=l,s=s.clone(),k&&(s.$globalPluginsApplied=!1),s.add({[P]:{type:e.path("_id").instance,...e.path("_id").options,immutable:!0,parent:!0,...i?{name:M||o,ref:o,filter:!0,pos:0,tablePos:0,hidden:!1,required:!0}:{}}}),y)for(const e in y)s.set(e,y[e]);s.set("autoCreate",!1),s.set("autoIndex",!1),s.static({parentPath:P,parentModel(){return this.model(o)}}),s.method({parentDocument({lean:e=!1,select:t}={}){const o=this.constructor.parentModel().findById(this[P]);return e&&o.lean(),t&&o.select(t),o}}),_&&s.add({_position:{type:Number,...i?{name:"Nº",tablePos:1,pos:1}:{}}}),g&&s.add({_total:{type:Number,...i?{name:"Tº",tablePos:2,pos:2}:{}}}),Object.keys(p).forEach(t=>{if(e.path(t)&&1===p[t]&&(s.add(e.pick([t])),s.path(t).options.fromParent=!0,s.path(t).options.immutable=!0,i)){let{hidden:e}=s.path(t).options;e?Array.isArray(e)||(e=[e]):e=[],s.path(t).options.hidden=e.concat(["create","update"])}}),s.method("save",(async function(){const e=await this.constructor.model(o).findById(this[P]);if(!e)throw new Error(`there is no parent in ${o} for ${l} document ${this._id}`);let t;if(this._id)t=e[r].id(this._id);else{if(!this._position)throw new Error(`weak model ${l} ain't have _id nor _position\n${JSON.stringify(this,null,2)}`);{const o="Human"===_?this._position-1:this._position;t=e[r][o]}}return t?(t.set(this),t.$locals=this.$locals):e[r].push(this),e.$locals=this.$locals,e.save()}),{suppressWarning:!0}),w&&s.add(w),m&&s.static(m),u&&s.method(u);const x=e.set("collection")||a.pluralize()(o),A=a.pluralize()(l);let N=[{$project:{[o.toLowerCase()]:"$_id",_id:0,[r]:1,...p,...g?{_total:{$size:"$"+r}}:{}}},{$unwind:{path:"$"+r,includeArrayIndex:"_position",preserveNullAndEmptyArrays:!1}},{$replaceRoot:{newRoot:{$mergeObjects:["$$ROOT","$"+r]}}},{$project:{[r]:0}}];"Human"===_&&N.push({$addFields:{_position:{$add:["$_position",1]}}}),$&&(N=[].concat($,N)),b&&(N=[].concat(N,b)),lock({lockName:A}).then(async e=>{try{await a.connection.dropCollection(A)}catch(e){}finally{await a.connection.createCollection(A,{viewOn:x,pipeline:N,...f?{collation:f}:{}}),localPromise.delay(2e4).then(e)}},e=>{if("MutexLockError"!==e.name)throw e}),h&&await h({weakSchema:s,parentSchema:e,db:a,aggregate:N,weakModelName:l}),a.model(l,s),await plugin(s,{name:l,db:a,itdfw:i,...t})}))};async function weakModels(e,t,o=!1){({lock:lock}=(0,_mongooseMutex.default)({db:e,TTL:60}));const{models:a}=e;await Promise.all(Object.keys(a).map(async i=>await plugin(a[i].schema,{name:i,db:e,itdfw:o,...t})))}exports.plugin=plugin;