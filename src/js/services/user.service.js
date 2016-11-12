export default class User {
	
	constructor(JWT, AppConstants, $http, $state, $q){
		'ngInject';

		this._JWT = JWT;
		this._AppConstants = AppConstants;
		this._$http = $http;
		this._$state = $state;
		this._$q = $q;

		this.current = null;
	}

	attemptAuth(type, credentials){
		let route = (type === 'login') ? '/login' : '';
		return this._$http({
			url : this._AppConstants.api + '/users' + route,
			method: 'POST', 
			data: {
				user: credentials
			} 
		}).then(
			(res) => {
				this._JWT.save(res.data.user.token);
				this.current = res.data.user
				return res;
			}
		);
	}

	logout(){
		this.current = null;
		this._JWT.destroy();

		this._$state.go(this._$state.$current, null, { reload: true });
	}

	verifyAuth(){
		
		let deferred = this._$q.defer();
		
		if(!this._JWT.get()){
			console.log('verifyAuth');
			deferred.resolve(false);
			console.log('no token');
			return deferred.promise;
		}
		console.log('sfafgad ---- verifyAuth');
		if(this.current){
			console.log('got user');
			deferred.resolve(true);
		} else {
			console.log('no user about to hit http');
			this._$http({
				url: this._AppConstants.api + '/user', 
				method: 'GET' 				
			}).then(
				(res) => {
					console.log("got response", res);
					this.current = res.data.user;
					deferred.resolve(true);
				},
				(err) => {
					console.log("got error", err);
					this._JWT.destroy();
					deferred.resolve(false);
				}
			);
		}

		console.log('done verifyAuth');
		return deferred.promise;
	}

	ensureAuthIs(bool){
		let deferred = this._$q.defer();

		this.verifyAuth().then((authValid) => {
			if (authValid !== bool){
				this._$state.go('app.home');
				deferred.resolve(false);
			} else {
				deferred.resolve(true);
			}
		});

		return deferred.promise;
	}


}