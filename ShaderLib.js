/**
 * Some library function for Cocos2dx shaders
 * Author: Winter
 */
/**
 * 点光源
 * Point Light
 */
const SHADERLIB_SPOTLIGHT =
    "uniform vec3 lightPos;\n"                      // 光源位置, vec3(200.0,988.0,100.0)
    + "uniform vec4 lightAmbientColor;\n"           // 环境光的颜色, vec4(1.0,1.0,1.0,1.0)"
    + "uniform vec4 lightDiffuseColor;\n"           // 散射光的颜色, vec4(1.0,1.0,1.0,1.0)
    + "uniform vec4 lightSpecularColor;\n"          // 反射光的颜色, vec4(1.0,1.0,1.0,1.0)
    + "uniform vec4 materialAmbientColor;\n"        // 材料的环境光颜色, vec4(1.0,1.0,1.0,1.0)
    + "uniform vec4 materialDiffuseColor;\n"        // 材料的散射光的颜色, vec4(1.0,1.0,1.0,1.0)
    + "uniform float materialSpecularExponent;\n"   // 材料的反射系数, 1.0
    + "uniform vec4 materialSpecularColor;\n"       // 材料的反射光颜色, vec4(1.0,1.0,1.0,1.0)
    + "uniform float lightSpotExponent;\n"          // 光的方向衰减系数, 设置lightDirection方向之后才好使, 5.0
    + "uniform vec3 lightDirection;\n"              // 光线的方向, 设置lightAngleRange范围之后才好使, vec3(1.0,-2.0,-0.6)
    + "uniform float lightAngleRange;\n"            // 光的扩散范围，设置为0的时候向四面八方发射，不为0的时候表示只向该角度内发射 0.0
    + "uniform vec3 eyePos;\n"                      // 视线的方向, vec3(0.0,-1.0,1.732)
    + "vec4 spotLight(vec3 normal,vec4 position){\n"
    + "     vec4 result_color = vec4(0.0,0.0,0.0,0.0);\n"
    + "     vec3 lightdir = lightPos - position.xyz;\n"
    + "     vec3 att_dist;\n"
    + "     att_dist.x = 1.0;\n"
    + "     att_dist.z = dot(lightdir,lightdir);\n"
    + "     att_dist.y = sqrt(att_dist.z);\n"
    + "     float att_factor = 1.0/dot(att_dist,vec3(0.5,0.0002,0.00008));\n"
    + "     lightdir = normalize(lightdir);\n"
    + "     if(lightAngleRange!=0.0){\n"
    + "          float spot_factor = dot(-lightdir, normalize(lightDirection));\n"
    + "          if(spot_factor >= cos(radians(lightAngleRange)))\n"
    + "               spot_factor = pow(spot_factor, lightSpotExponent);\n"
    + "          else\n"
    + "               spot_factor = 0.0;\n"
    + "          att_factor *= spot_factor;\n"
    + "     }\n"
    + "     if(att_factor>0.0){\n"
    + "          result_color += (lightAmbientColor * materialAmbientColor);\n"
    + "          float ndotl = max(0.0,dot(normal,lightdir));\n"
    + "          result_color +=  (ndotl * lightDiffuseColor * materialDiffuseColor);\n"
    + "          vec3 halfplane = normalize(lightdir + normalize(eyePos));\n"
    + "          float ndoth = dot(normal, halfplane);\n"
    + "          if (ndoth > 0.0)\n"
    + "               result_color += (pow(ndoth, materialSpecularExponent) * materialSpecularColor * lightSpecularColor);\n"
    + "          result_color *= att_factor;\n"
    + "     }\n"
    + "     return result_color;\n"
    + "}\n"

/**
 * 用坐标生成0~1之间不包括1的随机数
 * Generate a random number with coordinate
 */
const SHADERLIB_RANDOM_NUMBER =
    "float randFunc(float x,float y){\n"
    + "     return fract(sin(x*12.9876+y*4.1427)*43758.5453);\n"
    + "}\n"
/**
 * 循环滚动播放的动画
 * @param sinA 要移动的方向与X轴夹角的正弦值，由于角度是固定的，出于性能考虑，在外部把正弦余弦算好了再传进来
 * @param cosA 要移动的方向与X轴夹角的余弦值，同上
 * @param time 时间偏移量
 * @param speed 移动速度
 * @param texCoord 把v_texCoord传进来
 * @returns 偏移后的v_texCoord
 */
const SHADERLIB_LOOP_MOVE =
    "vec2 loopMove(float sinA,float cosA,float time,float speed,vec2 texCoord){\n"
    + "     float offsetX = v_texCoord.x-time*speed*cosA;\n"
    + "     float offsetY = v_texCoord.y-time*speed*sinA;\n"
    + "     offsetX = 1.0 - (ceil(offsetX) - offsetX);\n"
    + "     offsetY = 1.0 - (ceil(offsetY) - offsetY);\n"
    + "     return vec2(offsetX,offsetY);\n"
    + "}\n"
/**
 * 高斯模糊效果，性能较差，建议用法：先模糊，再截图，然后使用静态截图
 */
const SHADERLIB_GAUSSIAN_BLUR =
    "#define pow2(x) (x * x)\n"
    +"#define pi 3.1415926\n"
    +"varying vec4 v_fragmentColor;\n"
    +"varying vec2 v_texCoord;\n"
    +"uniform vec2 resolution; // 纹理尺寸\n"
    +"uniform float blurRadius; // 模糊半径\n"
    +"uniform float sampleNum;"
    +"float gaussian(vec2 point, float sigma) {\n"
    +"    return 1.0 / (2.0 * pi * pow2(sigma)) * exp(-((pow2(point.x) + pow2(point.y)) / (2.0 * pow2(sigma))));\n"
    +"}\n"
    +"vec4 blur(vec2 point)\n"
    +"{\n"
    +"    float sigma = float(blurRadius) * 0.5;\n"
    +"    vec2 scale = 1.0 / resolution.xy;\n"
    +"    float step = blurRadius / sampleNum;"
    +"    vec4 color = vec4(0.0)\n;"
    +"    float count = 0.0;\n"
    +"    for(float x = -blurRadius; x <= blurRadius; x+=step)\n"
    +"    {\n"
    +"        for(float y = -blurRadius; y <= blurRadius; y+=step)\n"
    +"        {\n"
    +"            vec2 offset = vec2(x, y);\n"
    +"            float weight = gaussian(offset, sigma);\n"
    +"            //float weight = (blurRadius - abs(x)) * (blurRadius - abs(y));\n"
    +"            color += texture2D(CC_Texture0, point + vec2(scale.x * offset.x, scale.y * offset.y)) * weight;\n"
    +"            count += weight;\n"
    +"        }\n"
    +"    }\n"
    +"    return color / count;\n"
    +"}\n"
    +"void main(void)\n"
    +"{\n"
    +"    gl_FragColor = vec4(blur(v_texCoord)) * v_fragmentColor;\n"
    +"}\n";
/**
 * 片段着色器, 随机扭动的效果
 * Fragment shader: Random twist
 * @param time 时间偏移量
 * @param wavelength 扭动的波长
 * @param amplitude 扭动的振幅
 */
const SHADERLIB_TWIST = 
    "#ifdef GL_ES\n"
    + "precision highp float;\n"
    + "#endif\n"
    + "varying vec4 v_fragmentColor;\n"
    + "varying vec2 v_texCoord;\n"
    + "varying vec4 v_position;\n"
    + "varying vec4 g_position;\n"
    + "uniform float time;\n"
    + "uniform float wavelength;\n"
    + "uniform float amplitude;\n"
    + SHADERLIB_RANDOM_NUMBER
    + "void main() {\n"
    + "     float rand1=randFunc(v_position.x,v_position.y);\n"
    + "     float rand2=randFunc(v_position.x*rand1,v_position.y*rand1);\n"
    + "     float rand3=randFunc(v_position.x*rand2,v_position.y*rand2);\n"
    + "     float rand4=randFunc(v_position.x*rand3,v_position.y*rand3);\n"
    + "     float param1=amplitude*sin(sqrt((v_texCoord.x+0.09)*(v_texCoord.x+0.09)+(v_texCoord.y+0.09)*(v_texCoord.y+0.09))*wavelength*1.31 - time*1.23);\n"
    + "     float param2=amplitude*sin(sqrt((v_texCoord.x-1.11)*(v_texCoord.x-1.11)+(v_texCoord.y+0.11)*(v_texCoord.y+0.11))*wavelength*1.13 - time*1.09);\n"
    + "     float param3=amplitude*sin(sqrt((v_texCoord.x+0.13)*(v_texCoord.x+0.13)+(v_texCoord.y-1.13)*(v_texCoord.y-1.13))*wavelength*0.97 - time*0.91);\n"
    + "     float param4=amplitude*sin(sqrt((v_texCoord.x-1.07)*(v_texCoord.x-1.07)+(v_texCoord.y-1.08)*(v_texCoord.y-1.08))*wavelength*0.83 - time*0.79);\n"
    + "     vec2 v_texCoord1=v_texCoord + rand1*param1 + rand2*param2 + rand3*param3 + rand4*param4;\n"
    + "     gl_FragColor = texture2D(CC_Texture0, v_texCoord1)*v_fragmentColor; \n"
    + "}";
/**
 * 颜色渐变，让一张图按照角度A从颜色colorFrom渐变到colorTo
 * @param colorFrom 渐变的起始颜色
 * @param colorTo 渐变的终止颜色
 * @param sinA 为了提升性能，所以事先在外部把角度A的sin值和cos值算出来传给shader
 * @param cosA 为了提升性能，所以事先在外部把角度A的sin值和cos值算出来传给shader
 */
const SHADERLIB_GRADIENT =
    "varying vec4 v_fragmentColor; \n"
    + "varying vec2 v_texCoord; \n"
    + "varying vec4 v_position;"
    + "uniform vec3 colorFrom; \n"
    + "uniform vec3 colorTo; \n"
    + "uniform float sinA;\n"
    + "uniform float cosA;\n"
    + "void main() { \n"
    + "     float f=v_texCoord.y*sinA+v_texCoord.x*cosA;\n"
    + "     gl_FragColor = texture2D(CC_Texture0, v_texCoord);\n"
    + "     if(gl_FragColor.w>0.0){\n"
    + "          gl_FragColor.xyz = vec3(colorFrom.x + (colorTo.x - colorFrom.x)*f,"
    + "               colorFrom.y + (colorTo.y - colorFrom.y)*f,"
    + "               colorFrom.z + (colorTo.z - colorFrom.z)*f);\n"
    + "     }\n"
    + "}";
/**
 * 图像描边
 * @param color 描边颜色
 * @param thickness 描边的厚度
 * @param textureSize 图像尺寸
 */
const SHADERLIB_STROKE =
    "#ifdef GL_ES\n"
    + "precision lowp float;\n"
    + "#endif\n"
    + "varying vec2 v_texCoord;\n"
    + "varying vec4 v_fragmentColor;\n"
    + "uniform vec3 color;\n"
    + "uniform float thickness;\n"
    + "uniform vec2 textureSize;\n"
    //由于原生和h5编译shader的原理不一样，h5的shader循环终止值必须是常量，因此做一个区分
    + (cc.sys.isNative?"":"const float maxThickness = 200.0;\n")
    + "void main(void)\n"
    + "{\n"
    + "     vec4 current = texture2D(CC_Texture0,v_texCoord);\n"
    + "     if(current.w==0.0){\n"
    + "          float dx = 1.0/textureSize.x;\n"
    + "          float dy = 1.0/textureSize.y;\n"
    + "          float distance = 0.0;\n"
    + "          "+(cc.sys.isNative?"for(float i=1.0;i<=thickness;i++){\n":"for(float i=1.0;i<=maxThickness;i++){\n")
    + "               if(distance>0.0"+(cc.sys.isNative?"){\n":" || i>thickness){\n")
    + "                    break;\n"
    + "               }\n"
    + "               "+(cc.sys.isNative?"for(float j=-i;j<=i;j++){\n":"for(float j=-maxThickness;j<=maxThickness;j++){\n")
    + "                    "+(cc.sys.isNative?"":"if(abs(j)>i){continue;}\n")
    + "                    if(texture2D(CC_Texture0,v_texCoord+vec2(dx*j,dy*i)).w>0.0){\n"
    + "                         distance = i;\n"
    + "                         break;\n"
    + "                    }\n"
    + "               }\n"
    + "               "+(cc.sys.isNative?"for(float j=-i;j<=i;j++){\n":"for(float j=-maxThickness;j<=maxThickness;j++){\n")
    + "                    "+(cc.sys.isNative?"":"if(abs(j)>i){continue;}\n")
    + "                    if(texture2D(CC_Texture0,v_texCoord+vec2(dx*j,-dy*i)).w>0.0){\n"
    + "                         distance = i;\n"
    + "                         break;\n"
    + "                    }\n"
    + "               }\n"
    + "               "+(cc.sys.isNative?"for(float j=-i;j<=i;j++){\n":"for(float j=-maxThickness;j<=maxThickness;j++){\n")
    + "                    "+(cc.sys.isNative?"":"if(abs(j)>i){continue;}\n")
    + "                    if(texture2D(CC_Texture0,v_texCoord+vec2(dx*i,dy*j)).w>0.0){\n"
    + "                         distance = i;\n"
    + "                         break;\n"
    + "                    }\n"
    + "               }\n"
    + "               "+(cc.sys.isNative?"for(float j=-i;j<=i;j++){\n":"for(float j=-maxThickness;j<=maxThickness;j++){\n")
    + "                    "+(cc.sys.isNative?"":"if(abs(j)>i){continue;}\n")
    + "                    if(texture2D(CC_Texture0,v_texCoord+vec2(-dx*i,dy*j)).w>0.0){\n"
    + "                         distance = i;\n"
    + "                         break;\n"
    + "                    }\n"
    + "               }\n"
    + "          }\n"
    + "          if(distance>0.0){\n"
    + "               current.xyz=color*(thickness + 1.0 -distance)/thickness;\n"
    + "               current.w=1.0;\n"
    + "          }\n"
    + "     }\n"
    + "     gl_FragColor = current;\n"
    + "}"
/**
 * 水面波光粼粼的效果，需要用到点光源和循环移动
 * 精简版点光源的参数已经调好，使用下面的TEST_SPOTLIGHT即可
 * 对一张高光图使用此shader，然后将高光图和背后的水面图混合模式设置为1,1
 */
const SHADERLIB_WATER_SURFACE =
    "#ifdef GL_ES\n"
    + "precision highp float;\n"
    + "#endif\n"
    + "varying vec2 v_texCoord; \n"
    + "varying vec4 v_position; \n"
    + "uniform float sinA;\n"
    + "uniform float cosA;\n"
    + "uniform float time;\n"
    + "uniform float speed;\n"
    // + "uniform sampler2D normalTexture;\n"       //法线图，可加可不加
    + SHADERLIB_LOOP_MOVE
    + TEST_SPOTLIGHT
    + "void main() { \n"
    + "     vec2 v_texCoord1=loopMove(sinA,cosA,time,speed,v_texCoord);\n"
    + "     vec2 v_texCoord2=loopMove(-sinA,-cosA,time,speed*0.8,v_texCoord);\n"
    + "     vec4 color1=texture2D(CC_Texture0, v_texCoord1);\n"
    + "     vec4 color2=texture2D(CC_Texture0, v_texCoord2);\n"
    + "     gl_FragColor = color1*color2;\n"
    // + "     vec4 normalColor = texture2D(normalTexture,v_texCoord);\n"       //法线图，可加可不加
    + "     gl_FragColor *= spotLight(v_position);\n"
    + "}";
const TEST_SPOTLIGHT =
    "const vec3 lightPos = vec3(200.0,988.0,50.0);\n"
    + "const vec4 lightAmbientColor = vec4(1.0,1.0,1.0,1.0);\n"
    + "const vec4 lightDiffuseColor = vec4(1.0,1.0,1.0,1.0);\n"
    + "const vec4 lightSpecularColor = vec4(1.0,1.0,1.0,1.0);\n"
    + "const vec4 materialAmbientColor = vec4(1.0,1.0,1.0,1.0);\n"
    + "const vec4 materialDiffuseColor = vec4(1.0,1.0,1.0,1.0);\n"
    + "const float materialSpecularExponent = 1.0;\n"
    + "const vec4 materialSpecularColor = vec4(1.0,1.0,1.0,1.0);\n"
    + "const float lightSpotExponent = 5.0;\n"
    + "const vec3 lightDirection = vec3(1.0,-2.0,-0.6);\n"
    + "const float lightAngleRange = 0.0;\n"
    + "const vec3 eyePos = vec3(0.0,-1.0,1.732);\n"
    + "vec4 spotLight(vec4 position){\n"
    + "     vec4 result_color = vec4(1.0,1.0,1.0,1.0);\n"
    + "     vec3 lightdir = lightPos - position.xyz;\n"
    + "     vec3 att_dist;\n"
    + "     att_dist.x = 1.0;\n"
    + "     att_dist.z = dot(lightdir,lightdir);\n"
    + "     att_dist.y = sqrt(att_dist.z);\n"
    + "     float att_factor = 1.0/dot(att_dist,vec3(0.5,0.0001,0.00002));\n"
    + "     lightdir = normalize(lightdir);\n"
    + "     result_color *= att_factor;\n"
    + "     return result_color;\n"
    + "}\n"