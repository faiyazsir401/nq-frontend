import { LABELS } from '../../../utils/constant';
import {HOW_IT_WORKS, WHY_CHOOSE_US} from '../../common/constants';

export const HowItWorks = () => {
  return (
    <div className="why-choose-us">
      <div className="feat bg-gray pt-5 pb-5">
        <div className="container">
          <div className="row" style={{justifyContent: 'center'}}>
            <div className="section-head col-sm-12">
              <h6>{LABELS.PROMO_TWO}</h6>
              <p>
                {/* Are you ready to embark on a transformative journey towards your personal and professional development? We are here to revolutionize the way you learn and connect with expert trainers. Our cutting-edge platform empowers you to take interactive sessions with skilled professionals, enhancing your skills and knowledge like never before. */}
              </p>
            </div>
            {HOW_IT_WORKS.map ((info, index) => {
              return (
                <div className="col-lg-4 col-sm-6" key={`why-us-${index}`}>
                  <div className="item">
                    <span className="icon feature_box_col_one">
                      {/* <i className="fa fa-globe" /> */}
                      {info.icon}
                    </span>
                    <h6>
                      <div style={{fontSize: '20px', textDecoration: 'underline', textUnderlineOffset: '0.4em', textDecorationColor: '#000080' }}>
                        {info.title}
                      </div>{' '}
                    </h6>

                    <p>
                      {info.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
