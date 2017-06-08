import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';
import {marketApiUrl} from '../../../config/api';

export class OssParam {
  key: string;
  policy: string;
  OSSAccessKeyId: string;
  success_action_status = '200'; // 让服务端返回200,不然，默认会返回204
  callback: string;
  signature: string;
}
export class OssSignModel {
  policy: string;
  accessid: string;
  signature: string;
  host: string;
  expire: number;
  dir: string;
  callback: string;
}
@Injectable()
export class OssUploadService {

  ossSign: OssSignModel;
  params: OssParam;

  constructor(private httpService: HttpService, private  http: Http) {
  }

  // 获取签名
  private getSignature() {
    return this.httpService.httpGet(`${marketApiUrl}/api/upload/oss`)
      .toPromise().then
      (
        response => {
          this.ossSign = response as OssSignModel;
          this.params = new OssParam();
          this.params.signature = this.ossSign.signature;
          this.params.policy = this.ossSign.policy;
          this.params.callback = this.ossSign.callback;
          this.params.key = this.ossSign.dir;
          this.params.OSSAccessKeyId = this.ossSign.accessid;
        }
      );
  }

  private getSuffix(filename: string): string {
    let suffix = '';
    const pos = filename.lastIndexOf('.');
    if (pos !== -1) {
      suffix = filename.substring(pos);
    }
    return suffix;
  }

  // 上传文件
  fileUpload(file: any): Promise<string> {
    return this.getSignature().then(res => {
      const form = new FormData();
      // 随机文件名
      const now = new Date();
      this.params.key += now.getTime() + this.getSuffix(file.name); // file.name;
      for (const k in this.params) {
        form.append(k, this.params[k]);
      }
      form.append(`file`, file);
      return this.http.post(this.ossSign.host, form).map(rs => {
      }).toPromise().then(rrs => {
        // 返回图片地址
        return `${this.ossSign.host}/${this.params.key}`;
      });
    });
  }
}
