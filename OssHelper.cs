using Aliyun.OSS;
using Jil;
using Rapid.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Rapid.Admin.Controllers
{
    public class OssHelper
    {
        private CallBackParam callbackparam = new CallBackParam();
        private DateTime BaseTime = new DateTime(1970, 1, 1);//Unix起始时间
        private String Endpoint { get; set; }
        private String Bucket { get; set; }
        /// <summary>
        /// 上传目录pollyng/(必须以‘/’结尾)
        /// </summary>
        private String Dir { get; set; }
        /// <summary>
        /// 用户请求的accessid
        /// </summary>
        private String AccessId { get; set; }
        private String AccessKey { get; set; }
        /// <summary>
        /// 默认10秒过期
        /// </summary>
        private Int64 ExpireTime { get; set; }
        /// <summary>
        /// 默认回调地址
        /// </summary>
        private String CallbackUrl { get; set; }
        /// <summary>
        /// 默认上传目录pollyng/;传图回调页面http://pollyreal.space
        /// </summary>
        public OssHelper()
        {
            Endpoint = BaseConfig.OssEndpoint;
            Bucket = BaseConfig.OssBucket;
            Dir = "pollyng/";
            AccessId = BaseConfig.OssAccessId;
            AccessKey = BaseConfig.OssAccessKey;
            ExpireTime = 10;
            CallbackUrl = "http://pollyreal.space";
        }
        /// <summary>
        /// 配置上传目录(必须以‘/’结尾),传图回调页面；
        /// </summary>
        /// <param name="directory">上传目录</param>
        /// <param name="callbackUrl">回调目录</param>
        public OssHelper(string directory = "", string callbackUrl = "")
            : this()
        {
            if (directory != "")
            {
                this.Dir = directory;
            }
            if (callbackUrl != "")
            {
                this.CallbackUrl = callbackUrl;
            }
        }
        public OssHelper(string directory = "")
            : this()
        {
            if (directory != "")
            {
                this.Dir = directory;
            }
        }

        /// <summary>
        /// 获取oss凭证
        /// </summary>
        /// <returns></returns>
        public OssSignModel GetOssSign()
        {
            callbackparam.callbackUrl = CallbackUrl;
            var host = string.Format("http://{0}.{1}", Bucket, Endpoint);
            OssClient client = new OssClient(Endpoint, AccessId, AccessKey);
            DateTime expiration = DateTime.Now.AddSeconds(ExpireTime);
            PolicyConditions policyConds = new PolicyConditions();
            policyConds.AddConditionItem(PolicyConditions.CondContentLengthRange, 0, 1050289624);
            policyConds.AddConditionItem(MatchMode.StartWith, PolicyConditions.CondKey, Dir);

            string postPolicy = client.GeneratePostPolicy(expiration.AddHours(8), policyConds);
            string encodedPolicy = Convert.ToBase64String(Encoding.UTF8.GetBytes(postPolicy.ToCharArray()));
            string postSignature = HmacSHA1Signature(AccessKey, encodedPolicy);

            var ossmodel = new OssSignModel();
            ossmodel.dir = Dir;
            ossmodel.host = host;
            ossmodel.accessid = AccessId;
            ossmodel.policy = encodedPolicy;
            ossmodel.signature = postSignature;
            ossmodel.expire = (expiration.Ticks - BaseTime.Ticks) / 10000000 - 8 * 60 * 60;
            ossmodel.callback = Convert.ToBase64String(Encoding.UTF8.GetBytes(JSON.Serialize(callbackparam).ToCharArray()));
            return ossmodel;
        }

        /// <summary>
        /// HmacSHA1签名
        /// </summary>
        /// <param name="key"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        private string HmacSHA1Signature(string key, string data)
        {
            string SignatureMethod = "HmacSHA1";
            using (var algorithm = KeyedHashAlgorithm.Create(SignatureMethod.ToUpperInvariant()))
            {
                algorithm.Key = Encoding.UTF8.GetBytes(key.ToCharArray());
                return Convert.ToBase64String(
                    algorithm.ComputeHash(Encoding.UTF8.GetBytes(data.ToCharArray())));
            }
        }

    }
    /// <summary>
    /// 回调地址参数
    /// </summary>
    public class CallBackParam
    {
        private string _callbackUrl = "";
        private string _callbackBody = "filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}";
        private string _callbackBodyType = "application/x-www-form-urlencoded";
        public string callbackUrl { get { return _callbackUrl; } set { _callbackUrl = value; } }
        /// <summary>
        /// 上传回调基本信息
        ///系统变量	含义
        ///bucket	移动应用上传到哪个存储空间
        ///object	移动应用上传到OSS保存的文件名
        ///etag	该上传的文件的etag，即返回给用户的etag字段
        ///size	该上传的文件的大小
        ///mimeType	资源类型
        ///imageInfo.height	图片高度
        ///imageInfo.width	图片宽度
        ///imageInfo.format	图片格式，如jpg、png，只以识别图片
        /// </summary>
        public string callbackBody { get { return _callbackBody; } set { _callbackBody = value; } }
        public string callbackBodyType { get { return _callbackBodyType; } set { _callbackBodyType = value; } }
    }
    /// <summary>
    /// OSS签名模型
    /// </summary>
    public class OssSignModel
    {
        public string policy { get; set; }
        public string accessid { get; set; }
        public string signature { get; set; }
        public string host { get; set; }
        public long expire { get; set; }
        public string dir { get; set; }
        /// <summary>
        /// 回调地址--BASE64编码Json字符串后
        /// </summary>
        public string callback { get; set; }

    }
}
